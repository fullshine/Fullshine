'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendCancellationToClient } from '@/lib/whatsapp'
import { promoDiscountFor } from '@/lib/promo'
import { puedeNotificar, modoSilencioso, setModoSilencioso } from '@/lib/notificaciones'
import { esCategoriaPrivada } from '@/lib/servicios'
import type { ActionResult, BookingStatus, DashboardStats, BookingWithRelations, Customer, Vehicle } from '@/types'
import { revalidatePath } from 'next/cache'

// --- AUTH GUARD ---

async function requireAuth(): Promise<{ authorized: true } | { authorized: false; error: string }> {
  try {
    // Read cookie directly — same check as middleware, no network round-trip
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const hasAuth = allCookies.some(c =>
      c.value && (
        (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
        c.name === 'supabase-auth-token'
      )
    )
    if (!hasAuth) {
      console.error('[requireAuth] no auth cookie found. cookies:', allCookies.map(c => c.name))
      return { authorized: false, error: 'No autorizado' }
    }
    return { authorized: true }
  } catch (e) {
    console.error('[requireAuth] error:', e)
    return { authorized: false, error: 'Error de autenticación' }
  }
}

// --- AUTH ---

export async function signIn(email: string, password: string): Promise<ActionResult> {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: 'Credenciales incorrectas' }
    return { success: true }
  } catch {
    return { success: false, error: 'Error de conexión' }
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch {
    return { success: false, error: 'Error al cerrar sesión' }
  }
}

// --- DASHBOARD ---

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0]
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [todayRes, weekRes, revenueRes, pendingRes, confirmedRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('booking_date', today),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('booking_date', weekStart),
      supabase.from('bookings').select('total_price_clp')
        .in('status', ['completed', 'review_sent'])
        .gte('booking_date', monthStart),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ])

    const finalizedBookings = revenueRes.data ?? []
    const revenueMonth = finalizedBookings.reduce((sum, b) => sum + (b.total_price_clp ?? 0), 0)
    const finalizedMonth = finalizedBookings.length
    const avgTicketMonth = finalizedMonth > 0 ? Math.round(revenueMonth / finalizedMonth) : 0

    return {
      success: true,
      data: {
        bookings_today: todayRes.count ?? 0,
        bookings_week: weekRes.count ?? 0,
        revenue_month: revenueMonth,
        finalized_month: finalizedMonth,
        avg_ticket_month: avgTicketMonth,
        pending_bookings: pendingRes.count ?? 0,
        confirmed_bookings: confirmedRes.count ?? 0,
      },
    }
  } catch {
    return { success: false, error: 'Error al cargar estadísticas' }
  }
}

// --- RESERVA MANUAL DEL ADMINISTRADOR ---

/**
 * Crea una o varias reservas desde el panel, sin validar disponibilidad.
 *
 * Es una acción SEPARADA de createBooking a propósito: saltarse el control de
 * horarios solo puede hacerlo alguien con sesión iniciada. Si fuera un
 * parámetro de la función pública, cualquiera podría enviarlo desde el
 * navegador y sobrecargar la agenda.
 *
 * Con varios servicios se crea una reserva por cada uno, encadenadas en el
 * tiempo. Así el kanban, los certificados, el calendario de mantención y los
 * reportes por servicio siguen funcionando igual — pero el cliente recibe
 * UN SOLO mensaje de WhatsApp, no uno por servicio.
 */
export async function crearReservaAdmin(input: {
  full_name: string
  phone: string
  email?: string
  vehicle_make: string
  vehicle_model: string
  vehicle_plate?: string
  vehicle_year?: number
  vehicle_type: string
  service_ids: string[]
  fecha: string          // YYYY-MM-DD
  hora: string           // HH:MM
  notas?: string
  avisar?: boolean       // enviar WhatsApp al cliente
}): Promise<ActionResult<{ creadas: number }>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }

  try {
    if (input.service_ids.length === 0) {
      return { success: false, error: 'Selecciona al menos un servicio' }
    }

    const digitos = input.phone.replace(/\D/g, '')
    if (digitos.length !== 9 && digitos.length !== 11) {
      return { success: false, error: 'El teléfono debe tener 9 dígitos' }
    }
    const telefono = digitos.startsWith('56') ? digitos : `56${digitos}`

    const supabase = createAdminClient()

    // ── Cliente ──
    let customerId: string
    const { data: existente } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq.${telefono},phone.eq.+${telefono},phone.eq.${digitos}`)
      .maybeSingle()

    if (existente) {
      customerId = existente.id
    } else {
      const { data: nuevo, error: errC } = await supabase
        .from('customers')
        .insert({
          full_name: input.full_name.trim(),
          phone: telefono,
          email: input.email?.trim() || null,
        })
        .select('id')
        .single()
      if (errC || !nuevo) return { success: false, error: errC?.message ?? 'No se pudo crear el cliente' }
      customerId = nuevo.id
    }

    // ── Vehículo ──
    // La tabla usa brand/plate; se prueba make/license_plate como respaldo.
    const base = {
      customer_id: customerId,
      model: input.vehicle_model.trim(),
      year: input.vehicle_year ?? new Date().getFullYear(),
      vehicle_type: input.vehicle_type,
    }
    const variantes: Record<string, unknown>[] = [
      { ...base, brand: input.vehicle_make.trim(), plate: input.vehicle_plate || null },
      { ...base, make: input.vehicle_make.trim(), license_plate: input.vehicle_plate || null },
    ]

    let vehicleId: string | null = null
    let errV: string | null = null
    for (const v of variantes) {
      const { data, error } = await supabase.from('vehicles').insert(v).select('id').single()
      if (!error && data) { vehicleId = data.id; errV = null; break }
      errV = error?.message ?? null
      if (error?.code === '23505') {
        const { data: yaExiste } = await supabase
          .from('vehicles').select('id').eq('customer_id', customerId).limit(1).maybeSingle()
        if (yaExiste) { vehicleId = yaExiste.id; errV = null; break }
      }
    }
    if (!vehicleId) return { success: false, error: `No se pudo registrar el vehículo: ${errV}` }

    // ── Servicios ──
    const { data: servicios, error: errS } = await supabase
      .from('services')
      .select('id, name, category, duration_hours, prices:service_prices(vehicle_type, price_clp)')
      .in('id', input.service_ids)

    if (errS || !servicios?.length) return { success: false, error: 'Servicios no encontrados' }

    // Se respeta el orden en que fueron seleccionados
    const ordenados = input.service_ids
      .map(id => servicios.find(s => s.id === id))
      .filter(Boolean) as typeof servicios

    // ── Reservas encadenadas ──
    const [hh, mm] = input.hora.split(':').map(Number)
    let cursor = hh * 60 + (mm || 0)
    const hhmm = (m: number) =>
      `${Math.floor((m % 1440) / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:00`

    const resumen: { nombre: string; precio: number }[] = []
    let creadas = 0

    for (const s of ordenados) {
      const minutos = Math.round((s.duration_hours ?? 1) * 60)
      const precioLista = (s.prices as { vehicle_type: string; price_clp: number }[] | null)
        ?.find(p => p.vehicle_type === input.vehicle_type)?.price_clp ?? 0

      const descuento = promoDiscountFor(s.category)
      const total = descuento > 0 ? Math.round(precioLista * (1 - descuento)) : precioLista

      const { error } = await supabase.from('bookings').insert({
        customer_id: customerId,
        vehicle_id: vehicleId,
        service_id: s.id,
        status: 'pending',
        booking_date: input.fecha,
        slot_start: hhmm(cursor),
        slot_end: hhmm(cursor + minutos),
        total_price_clp: total,
        customer_notes: input.notas?.trim() || null,
      })

      if (error) {
        console.error('[crearReservaAdmin]', error.message)
        return { success: false, error: `Error al crear la reserva: ${error.message}` }
      }

      resumen.push({ nombre: s.name, precio: total })
      cursor += minutos
      creadas++
    }

    // Los convenios B2B nacen callados: el titular es la empresa, no el
    // dueño del vehículo, y no corresponde mandarle certificados ni reseñas.
    const esConvenio = ordenados.some(s => esCategoriaPrivada(s.category))
    if (esConvenio) {
      await supabase
        .from('bookings')
        .update({ notificaciones_activas: false })
        .eq('customer_id', customerId)
        .eq('booking_date', input.fecha)
    }

    // ── Un solo aviso al cliente, con todos los servicios ──
    if (input.avisar !== false && !esConvenio && !(await modoSilencioso())) {
      const { sendRawMessage } = await import('@/lib/whatsapp')
      const fecha = new Date(`${input.fecha}T12:00:00`).toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
      const suma = resumen.reduce((a, b) => a + b.precio, 0)
      const nombre = input.full_name.trim().split(' ')[0]

      const mensaje =
        `👋 ¡Hola ${nombre}!\n\n` +
        `✅ Tu reserva en *Fullshine Detailing* quedó registrada.\n\n` +
        `🚗 *Vehículo:* ${input.vehicle_make} ${input.vehicle_model}\n` +
        `📅 *Fecha:* ${fecha}\n` +
        `🕐 *Hora:* ${input.hora}\n\n` +
        `🛠️ *Servicios:*\n` +
        resumen.map(r => `• ${r.nombre}`).join('\n') +
        (suma > 0 ? `\n\n💰 *Total:* $${suma.toLocaleString('es-CL')}` : '') +
        `\n\n📍 Camilo Henríquez 381, Concepción\n\n` +
        `Si tienes alguna duda, responde este mensaje. ¡Te esperamos! 🙌`

      await sendRawMessage(telefono, mensaje).catch(e =>
        console.error('[crearReservaAdmin] WhatsApp:', e?.message)
      )
    }

    revalidatePath('/admin/kanban')
    revalidatePath('/admin/agenda')
    return { success: true, data: { creadas } }
  } catch (e) {
    console.error('[crearReservaAdmin]', e)
    return { success: false, error: (e as Error).message ?? 'Error inesperado' }
  }
}

// --- EDICIÓN DE RESERVAS ---

/** Datos que el modal necesita para precargarse. */
export async function getReservaParaEditar(
  bookingId: string
): Promise<ActionResult<{
  id: string
  service_id: string
  booking_date: string
  slot_start: string
  total_price_clp: number
  precio_manual: boolean
  notificaciones_activas: boolean
  customer_notes: string | null
  status: string
  vehicle_type: string
  customer_name: string
  customer_phone: string
  vehiculo: string
  tiene_certificado: boolean
  cambios: { campo: string; valor_antes: string | null; valor_luego: string | null; created_at: string }[]
}>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()

    const { data: b, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(full_name, phone), vehicle:vehicles(*), service:services(name)')
      .eq('id', bookingId)
      .single()

    if (error || !b) return { success: false, error: 'Reserva no encontrada' }

    const { data: cert } = await supabase
      .from('certificates')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle()

    // Si la migración 24 aún no corre, la tabla no existe y esto queda vacío.
    const { data: cambios } = await supabase
      .from('booking_changes')
      .select('campo, valor_antes, valor_luego, created_at')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(20)

    const v = b.vehicle as Record<string, unknown> | null
    const marca = (v?.brand ?? v?.make ?? '') as string
    const modelo = (v?.model ?? '') as string
    const patente = (v?.plate ?? v?.license_plate ?? '') as string

    return {
      success: true,
      data: {
        id: b.id,
        service_id: b.service_id,
        booking_date: b.booking_date ?? '',
        slot_start: (b.slot_start ?? '09:00:00').slice(0, 5),
        total_price_clp: b.total_price_clp ?? 0,
        precio_manual: b.precio_manual ?? false,
        notificaciones_activas: b.notificaciones_activas ?? true,
        customer_notes: b.customer_notes ?? null,
        status: b.status,
        vehicle_type: (v?.vehicle_type ?? 'hatch_sedan') as string,
        customer_name: b.customer?.full_name ?? 'Cliente',
        customer_phone: b.customer?.phone ?? '',
        vehiculo: [marca, modelo, patente && `(${patente})`].filter(Boolean).join(' '),
        tiene_certificado: !!cert,
        cambios: cambios ?? [],
      },
    }
  } catch (e) {
    return { success: false, error: (e as Error).message ?? 'Error inesperado' }
  }
}

/**
 * Edita una reserva existente.
 *
 * Reglas de precio:
 *  - Si el administrador escribe un monto distinto al calculado, la reserva
 *    queda marcada como `precio_manual` y ningún cambio posterior de servicio
 *    lo pisa. Es para no perder un valor negociado con el cliente.
 *  - Si no lo toca, el precio se recalcula desde la tabla de tarifas.
 *
 * Cada campo modificado se registra en `booking_changes`.
 */
export async function actualizarReservaAdmin(
  bookingId: string,
  cambios: {
    service_id?: string
    booking_date?: string
    slot_start?: string          // HH:MM
    total_price_clp?: number
    customer_notes?: string | null
    status?: string
    notificaciones_activas?: boolean
  },
  avisarCliente = false
): Promise<ActionResult<{ aviso: string | null }>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()

    const { data: antes, error: errB } = await supabase
      .from('bookings')
      .select('*, customer:customers(full_name, phone), vehicle:vehicles(*), service:services(name, category, duration_hours)')
      .eq('id', bookingId)
      .single()

    if (errB || !antes) return { success: false, error: 'Reserva no encontrada' }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const registro: { campo: string; antes: string; luego: string }[] = []

    // ── Servicio ──
    let servicioNuevo: { name: string; category: string; duration_hours: number } | null = null
    if (cambios.service_id && cambios.service_id !== antes.service_id) {
      const { data: s } = await supabase
        .from('services')
        .select('name, category, duration_hours')
        .eq('id', cambios.service_id)
        .single()
      if (!s) return { success: false, error: 'El servicio seleccionado no existe' }

      servicioNuevo = s
      patch.service_id = cambios.service_id
      registro.push({ campo: 'servicio', antes: antes.service?.name ?? '—', luego: s.name })
    }

    // ── Fecha ──
    if (cambios.booking_date && cambios.booking_date !== antes.booking_date) {
      patch.booking_date = cambios.booking_date
      registro.push({ campo: 'fecha', antes: antes.booking_date ?? '—', luego: cambios.booking_date })
    }

    // ── Hora (recalcula el término según la duración del servicio) ──
    const horaActual = (antes.slot_start ?? '').slice(0, 5)
    if (cambios.slot_start && cambios.slot_start !== horaActual) {
      const horas = servicioNuevo?.duration_hours ?? antes.service?.duration_hours ?? 1
      const [hh, mm] = cambios.slot_start.split(':').map(Number)
      const inicio = hh * 60 + (mm || 0)
      const fin = inicio + Math.round(horas * 60)
      const fmt = (m: number) =>
        `${Math.floor((m % 1440) / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:00`

      patch.slot_start = fmt(inicio)
      patch.slot_end = fmt(fin)
      registro.push({ campo: 'hora', antes: horaActual || '—', luego: cambios.slot_start })
    } else if (servicioNuevo) {
      // Cambió el servicio pero no la hora: el término igual se corre.
      const [hh, mm] = horaActual.split(':').map(Number)
      const inicio = (hh || 9) * 60 + (mm || 0)
      const fin = inicio + Math.round(servicioNuevo.duration_hours * 60)
      patch.slot_end =
        `${Math.floor((fin % 1440) / 60).toString().padStart(2, '0')}:${(fin % 60).toString().padStart(2, '0')}:00`
    }

    // ── Precio ──
    if (cambios.total_price_clp !== undefined && cambios.total_price_clp !== antes.total_price_clp) {
      patch.total_price_clp = cambios.total_price_clp
      patch.precio_manual = true
      registro.push({
        campo: 'precio',
        antes: `$${(antes.total_price_clp ?? 0).toLocaleString('es-CL')}`,
        luego: `$${cambios.total_price_clp.toLocaleString('es-CL')}`,
      })
    } else if (servicioNuevo && !antes.precio_manual) {
      // Servicio distinto y precio nunca tocado a mano: se recalcula.
      const v = antes.vehicle as Record<string, unknown> | null
      const tipo = (v?.vehicle_type ?? 'hatch_sedan') as string

      const { data: tarifa } = await supabase
        .from('service_prices')
        .select('price_clp')
        .eq('service_id', cambios.service_id!)
        .eq('vehicle_type', tipo)
        .maybeSingle()

      if (tarifa) {
        const pct = promoDiscountFor(servicioNuevo.category)
        const nuevo = pct > 0 ? Math.round(tarifa.price_clp * (1 - pct)) : tarifa.price_clp
        if (nuevo !== antes.total_price_clp) {
          patch.total_price_clp = nuevo
          registro.push({
            campo: 'precio',
            antes: `$${(antes.total_price_clp ?? 0).toLocaleString('es-CL')}`,
            luego: `$${nuevo.toLocaleString('es-CL')} (recalculado)`,
          })
        }
      }
    }

    // ── Notas y estado ──
    if (cambios.customer_notes !== undefined && cambios.customer_notes !== antes.customer_notes) {
      patch.customer_notes = cambios.customer_notes
      registro.push({ campo: 'notas', antes: antes.customer_notes ?? '—', luego: cambios.customer_notes ?? '—' })
    }

    if (cambios.status && cambios.status !== antes.status) {
      patch.status = cambios.status
      registro.push({ campo: 'estado', antes: antes.status, luego: cambios.status })
    }

    if (
      cambios.notificaciones_activas !== undefined &&
      cambios.notificaciones_activas !== (antes.notificaciones_activas ?? true)
    ) {
      patch.notificaciones_activas = cambios.notificaciones_activas
      registro.push({
        campo: 'avisos al cliente',
        antes: (antes.notificaciones_activas ?? true) ? 'activados' : 'desactivados',
        luego: cambios.notificaciones_activas ? 'activados' : 'desactivados',
      })
    }

    if (registro.length === 0) return { success: true, data: { aviso: null } }

    const { error: errU } = await supabase.from('bookings').update(patch).eq('id', bookingId)
    if (errU) {
      console.error('[actualizarReservaAdmin]', errU.message)
      return { success: false, error: `No se pudo guardar: ${errU.message}` }
    }

    // ── Auditoría (silenciosa si la migración 24 no está aplicada) ──
    await supabase.from('booking_changes').insert(
      registro.map(r => ({
        booking_id: bookingId,
        campo: r.campo,
        valor_antes: r.antes,
        valor_luego: r.luego,
        autor: 'admin',
      }))
    )

    // ── Aviso al cliente ──
    let aviso: string | null = null

    if (avisarCliente) {
      const permiso = await puedeNotificar(bookingId)
      if (!permiso.permitido) {
        aviso = `Los cambios se guardaron, pero no se avisó al cliente: ${permiso.motivo}.`
      } else if (!antes.customer?.phone) {
        aviso = 'Los cambios se guardaron, pero el cliente no tiene teléfono registrado.'
      } else {
        const { sendRawMessage } = await import('@/lib/whatsapp')
        const fechaFinal = (patch.booking_date as string) ?? antes.booking_date
        const horaFinal = ((patch.slot_start as string) ?? antes.slot_start ?? '').slice(0, 5)
        const servicioFinal = servicioNuevo?.name ?? antes.service?.name ?? 'tu servicio'
        const nombre = (antes.customer.full_name ?? 'Hola').split(' ')[0]

        const fechaTexto = fechaFinal
          ? new Date(`${fechaFinal}T12:00:00`).toLocaleDateString('es-CL', {
              weekday: 'long', day: 'numeric', month: 'long',
            })
          : ''

        const mensaje =
          `👋 Hola ${nombre}, te escribimos de *Fullshine Detailing*.\n\n` +
          `Actualizamos los datos de tu reserva:\n\n` +
          `🛠️ *Servicio:* ${servicioFinal}\n` +
          (fechaTexto ? `📅 *Fecha:* ${fechaTexto}\n` : '') +
          (horaFinal ? `🕐 *Hora:* ${horaFinal}\n` : '') +
          `\n📍 Camilo Henríquez 381, Concepción\n\n` +
          `Si algo no calza, respóndenos este mensaje y lo corregimos. ¡Gracias! 🙌`

        try {
          await sendRawMessage(antes.customer.phone, mensaje)
        } catch (e) {
          aviso = `Los cambios se guardaron, pero el WhatsApp falló: ${(e as Error).message}`
        }
      }
    }

    // El certificado ya emitido queda desactualizado si cambió el servicio.
    if (servicioNuevo) {
      const { data: cert } = await supabase
        .from('certificates')
        .select('certificate_code')
        .eq('booking_id', bookingId)
        .maybeSingle()
      if (cert) {
        aviso = (aviso ? aviso + ' ' : '') +
          `Ojo: el certificado ${cert.certificate_code} sigue diciendo "${antes.service?.name}". Vuelve a emitirlo.`
      }
    }

    revalidatePath('/admin/kanban')
    revalidatePath('/admin/dashboard')
    return { success: true, data: { aviso } }
  } catch (e) {
    console.error('[actualizarReservaAdmin]', e)
    return { success: false, error: (e as Error).message ?? 'Error inesperado' }
  }
}

// --- MODO SILENCIOSO GLOBAL ---

export async function getModoSilencioso(): Promise<ActionResult<boolean>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  return { success: true, data: await modoSilencioso() }
}

export async function cambiarModoSilencioso(activo: boolean): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    await setModoSilencioso(activo)
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message ?? 'No se pudo guardar' }
  }
}

// --- HISTORIAL MENSUAL ---

export type MesHistorico = {
  periodo: string        // '2026-08'
  etiqueta: string       // 'Agosto 2026'
  ingresos: number
  finalizados: number
  ticket: number
  variacion: number | null  // % respecto al mes anterior
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/**
 * Ingresos por mes de los últimos N meses.
 *
 * Se cuenta como ingreso el trabajo FINALIZADO (completed o review_sent),
 * no el agendado: una reserva que no se ejecutó no es venta.
 *
 * Una sola consulta trae todo el período y se agrupa en memoria; con el
 * volumen de un taller son cientos de filas, no millones.
 */
/**
 * Mes más antiguo que se muestra en el dashboard, en formato YYYY-MM.
 * Todo lo anterior queda fuera del gráfico y de las tarjetas.
 */
const HISTORIAL_DESDE = '2026-07'

export async function getHistorialMensual(meses = 12): Promise<ActionResult<MesHistorico[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()
    const hoy = new Date()

    // Primer día del mes más antiguo del rango
    const desde = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1)
    const calculado = `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, '0')}`

    // Nunca se muestra nada anterior a HISTORIAL_DESDE: los meses previos
    // corresponden al taller anterior y sus cifras no son comparables.
    const periodoInicial = calculado < HISTORIAL_DESDE ? HISTORIAL_DESDE : calculado
    const desdeStr = `${periodoInicial}-01`

    const { data, error } = await supabase
      .from('bookings')
      .select('booking_date, total_price_clp')
      .in('status', ['completed', 'review_sent'])
      .gte('booking_date', desdeStr)

    if (error) return { success: false, error: error.message }

    // Acumular por período
    const acc: Record<string, { total: number; n: number }> = {}
    for (const b of data ?? []) {
      const periodo = (b.booking_date ?? '').substring(0, 7)
      if (!periodo) continue
      if (!acc[periodo]) acc[periodo] = { total: 0, n: 0 }
      acc[periodo].total += b.total_price_clp ?? 0
      acc[periodo].n += 1
    }

    // Serie completa, incluyendo meses sin ventas (para no romper la lectura)
    const serie: MesHistorico[] = []
    for (let i = meses - 1; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const periodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (periodo < HISTORIAL_DESDE) continue
      const v = acc[periodo] ?? { total: 0, n: 0 }
      serie.push({
        periodo,
        etiqueta: `${MESES[d.getMonth()]} ${d.getFullYear()}`,
        ingresos: v.total,
        finalizados: v.n,
        ticket: v.n > 0 ? Math.round(v.total / v.n) : 0,
        variacion: null,
      })
    }

    // Variación mes a mes
    for (let i = 1; i < serie.length; i++) {
      const previo = serie[i - 1].ingresos
      if (previo > 0) {
        serie[i].variacion = Math.round(((serie[i].ingresos - previo) / previo) * 100)
      }
    }

    return { success: true, data: serie }
  } catch (e) {
    console.error('[getHistorialMensual]', e)
    return { success: false, error: 'Error al cargar el historial' }
  }
}

// --- RECENT BOOKINGS ---

export async function getRecentBookings(): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar reservas recientes' }
    return { success: true, data: (data ?? []) as BookingWithRelations[] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- BOOKINGS ---

export async function getBookings(filters?: {
  status?: BookingStatus
  date?: string
  search?: string
}): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .order('slot_start', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.date) query = query.eq('booking_date', filters.date)

    const { data, error } = await query
    if (error) return { success: false, error: 'Error al cargar reservas' }

    let result = (data ?? []) as BookingWithRelations[]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(b =>
        b.customer?.full_name?.toLowerCase().includes(q) ||
        b.customer?.phone?.includes(q) ||
        b.vehicle?.license_plate?.toLowerCase().includes(q)
      )
    }

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()

    if (status === 'cancelled') {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, customer:customers(full_name, phone), service:services(name)')
        .eq('id', bookingId)
        .single()

      const permiso = await puedeNotificar(bookingId)
      if (booking?.customer?.phone && permiso.permitido) {
        sendCancellationToClient({
          phone: booking.customer.phone,
          customerName: booking.customer.full_name,
          serviceName: booking.service?.name ?? '',
          scheduledAt: booking.booking_date && booking.slot_start ? `${booking.booking_date}T${booking.slot_start}` : booking.slot_start ?? '',
        }).catch(console.error)
      }
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) return { success: false, error: 'Error al actualizar estado' }
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- CUSTOMERS ---

export async function getCustomers(search?: string): Promise<ActionResult<Customer[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    let query = supabase.from('customers').select('*').order('full_name')
    if (search) query = query.ilike('full_name', `%${search}%`)
    const { data, error } = await query
    if (error) return { success: false, error: 'Error al cargar clientes' }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateCustomer(
  id: string,
  updates: Partial<Pick<Customer, 'full_name' | 'email' | 'phone' | 'notes'>>
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { success: false, error: 'Error al actualizar cliente' }
    revalidatePath('/admin/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: vehicles } = await supabase.from('vehicles').select('id').eq('customer_id', id)
    if (vehicles?.length) {
      const vehicleIds = vehicles.map((v: any) => v.id)
      await supabase.from('bookings').delete().in('vehicle_id', vehicleIds)
      await supabase.from('vehicles').delete().eq('customer_id', id)
    }
    await supabase.from('bookings').delete().eq('customer_id', id)
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- VEHICLES ---

export async function getVehiclesByCustomer(customerId: string): Promise<ActionResult<Vehicle[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar vehículos' }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- CRM KANBAN ---

export async function getAllBookings(): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .not('status', 'eq', 'cancelled')
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar reservas' }
    return { success: true, data: (data ?? []) as BookingWithRelations[] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function moveBookingStage(
  bookingId: string,
  newStatus: string
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
    if (error) { console.error('[moveBookingStage]', error); return { success: false, error: error.message } }
    revalidatePath('/admin/kanban')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function sendPaymentLink(bookingId: string): Promise<ActionResult<{ paymentUrl: string }>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), service:services(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }

    const storedTotal = booking.total_price_clp ?? 0

    // total_price_clp already has the discount applied from createBooking
    // but if booking was created manually or before the discount logic, recalculate
    const total = storedTotal
    const amount = Math.round(total * 0.2)
    const orderId = `FS-${bookingId.substring(0, 8)}-${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fullshine.autos'

    let paymentUrl = ''
    try {
      const { createPaymentLink } = await import('@/lib/flow')
      const result = await createPaymentLink({
        orderId,
        amount,
        subject: `Anticipo Fullshine - ${booking.service?.name ?? 'Detailing'}`,
        customerEmail: booking.customer?.email ?? undefined,
        urlReturn: `${baseUrl}/reservar/pago-exitoso`,
        urlConfirmation: `${baseUrl}/api/flow/webhook`,
      })
      paymentUrl = result.url

      await supabase.from('bookings').update({
        payment_link: paymentUrl,
        payment_amount: amount,
        flow_order_id: orderId,
        status: 'payment_sent',
        updated_at: new Date().toISOString(),
      }).eq('id', bookingId)
    } catch (flowErr) {
      console.error('[Flow]', flowErr)
      return { success: false, error: 'Error al crear link de pago en Flow' }
    }

    const permisoPago = await puedeNotificar(bookingId)
    if (!permisoPago.permitido) {
      return { success: false, error: `${permisoPago.motivo}. El link es: ${paymentUrl}` }
    }

    if (booking.customer?.phone) {
      const { sendPaymentLinkToClient } = await import('@/lib/whatsapp')
      sendPaymentLinkToClient({
        phone: booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName: booking.service?.name ?? '',
        totalPrice: total,
        // Se reconstruye el precio original solo si hay promo vigente para
        // esa categoría. Antes dividía por 0.6 —un 40% inventado— siempre.
        basePrice: (() => {
          const pct = promoDiscountFor(booking.service?.category)
          return pct > 0 ? Math.round(total / (1 - pct)) : undefined
        })(),
        paymentAmount: amount,
        paymentLink: paymentUrl,
        scheduledAt: booking.booking_date && booking.slot_start
          ? `${booking.booking_date}T${booking.slot_start}`
          : booking.slot_start ?? '',
      }).catch(console.error)
    }

    revalidatePath('/admin/kanban')
    return { success: true, data: { paymentUrl } }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function sendReviewRequest(bookingId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), service:services(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }

    if (!booking.customer?.phone) {
      return { success: false, error: 'La reserva no tiene teléfono de cliente' }
    }

    const permisoResena = await puedeNotificar(bookingId)
    if (!permisoResena.permitido) return { success: false, error: permisoResena.motivo! }

    // El envío se AWAITEA y su error se devuelve: antes reventaba silenciosamente
    // y el kanban mostraba "Resena solicitada" aunque no hubiera salido nada.
    try {
      const { sendReviewRequestToClient } = await import('@/lib/whatsapp')
      await sendReviewRequestToClient({
        phone: booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName: booking.service?.name ?? '',
      })
    } catch (e) {
      console.error('[sendReviewRequest] WhatsApp:', e)
      return { success: false, error: `WhatsApp falló: ${(e as Error).message}` }
    }

    const { error: errUpdate } = await supabase
      .from('bookings')
      .update({ status: 'review_sent' })
      .eq('id', bookingId)

    if (errUpdate) {
      console.error('[sendReviewRequest] update:', errUpdate)
      // El mensaje sí se envió; solo falló guardar el estado.
      return {
        success: false,
        error: `Mensaje enviado, pero no se pudo guardar el estado: ${errUpdate.message}`,
      }
    }

    revalidatePath('/admin/kanban')
    return { success: true }
  } catch (e) {
    console.error('[sendReviewRequest]', e)
    return { success: false, error: (e as Error).message ?? 'Error inesperado' }
  }
}

// Reenvía la confirmación de una reserva (WhatsApp al cliente + push al negocio).
// Útil cuando el envío automático falló al crear la reserva.
export async function resendConfirmation(bookingId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }
    if (!booking.customer?.phone) return { success: false, error: 'La reserva no tiene teléfono de cliente' }

    const permisoReenvio = await puedeNotificar(bookingId)
    if (!permisoReenvio.permitido) return { success: false, error: permisoReenvio.motivo! }

    const scheduledAt = booking.booking_date && booking.slot_start
      ? `${booking.booking_date}T${booking.slot_start}`
      : booking.slot_start ?? ''
    const total = booking.total_price_clp ?? 0
    const descuentoVigente = promoDiscountFor(booking.service?.category)

    const { sendBookingConfirmationToClient, sendNewBookingToAdmin } = await import('@/lib/whatsapp')
    const { sendPushToAdmin } = await import('@/lib/push')

    await Promise.all([
      sendBookingConfirmationToClient({
        phone: booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName: booking.service?.name ?? '',
        scheduledAt,
        vehicleMake: booking.vehicle?.brand ?? '',
        vehicleModel: booking.vehicle?.model ?? '',
        totalPrice: total > 0 ? total : undefined,
        // Igual que arriba: el descuento sale de la configuración de promo.
        basePrice: descuentoVigente > 0 && total > 0
          ? Math.round(total / (1 - descuentoVigente))
          : undefined,
        discountPct: descuentoVigente > 0 ? descuentoVigente : undefined,
      }).catch(e => console.error('[Reenvío WhatsApp cliente]', e?.message)),
      sendNewBookingToAdmin({
        customerName: booking.customer.full_name,
        customerPhone: booking.customer.phone,
        serviceName: booking.service?.name ?? '',
        scheduledAt,
        vehicleMake: booking.vehicle?.brand ?? '',
        vehicleModel: booking.vehicle?.model ?? '',
      }).catch(e => console.error('[Reenvío WhatsApp admin]', e?.message)),
      sendPushToAdmin(
        '🔔 Reserva (reenvío)',
        `${booking.customer.full_name} · ${booking.service?.name ?? ''}`.trim()
      ).catch(e => console.error('[Reenvío push]', e?.message)),
    ])

    return { success: true }
  } catch (e) {
    console.error('[resendConfirmation]', e)
    return { success: false, error: (e as Error).message ?? 'Error inesperado' }
  }
}
