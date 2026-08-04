'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { sendMaintenanceReminder } from '@/lib/whatsapp'
import { procesarMantenciones } from '@/lib/mantenciones'

export type MantencionFila = {
  id: string
  due_at: string
  status: string
  cycle: number
  applied_at: string
  contact_1_at: string | null
  contact_2_at: string | null
  notes: string | null
  customer: { id: string; full_name: string; phone: string } | null
  // Fila completa: el proyecto usa brand/plate en unas partes y
  // make/license_plate en otras. Se lee el que exista.
  vehicle: Record<string, string | null> | null
}

const SELECT = `
  id, due_at, status, cycle, applied_at, contact_1_at, contact_2_at, notes,
  customer:customers(id, full_name, phone),
  vehicle:vehicles(*)
`


/** Todas las mantenciones vivas, ordenadas por urgencia. */
export async function getMantenciones() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('maintenance_schedule')
    .select(SELECT)
    .order('due_at', { ascending: true })

  if (error) return { success: false as const, error: error.message, data: [] }
  return { success: true as const, data: (data ?? []) as unknown as MantencionFila[] }
}

/** Cambia el estado a mano desde el panel. */
export async function actualizarMantencion(
  id: string,
  cambios: { status?: string; notes?: string }
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('maintenance_schedule')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/mantenciones')
  return { success: true }
}

/** Posterga la mantención N meses (el cliente pidió esperar). */
export async function posponerMantencion(id: string, meses: number) {
  const supabase = createAdminClient()

  const { data: fila, error: errLectura } = await supabase
    .from('maintenance_schedule')
    .select('due_at')
    .eq('id', id)
    .single()

  if (errLectura || !fila) return { success: false, error: 'Mantención no encontrada' }

  const nueva = new Date(fila.due_at + 'T12:00:00')
  nueva.setMonth(nueva.getMonth() + meses)

  const { error } = await supabase
    .from('maintenance_schedule')
    .update({
      due_at: nueva.toISOString().split('T')[0],
      // Se reinicia el ciclo de contacto para que vuelva a avisar a tiempo
      status: 'pending',
      contact_1_at: null,
      contact_2_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/mantenciones')
  return { success: true }
}

/** Manda el recordatorio ahora, sin esperar al cron. */
export async function enviarRecordatorioAhora(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('maintenance_schedule')
    .select(SELECT)
    .eq('id', id)
    .single<MantencionFila>()

  if (error || !data) return { success: false, error: 'Mantención no encontrada' }
  if (!data.customer?.phone) return { success: false, error: 'El cliente no tiene teléfono' }

  try {
    await sendMaintenanceReminder({
      phone: data.customer.phone,
      customerName: data.customer.full_name?.split(' ')[0] ?? 'Hola',
      vehicle: `${data.vehicle?.make ?? data.vehicle?.brand ?? ''} ${data.vehicle?.model ?? ''}`.trim() || 'tu vehículo',
      dueMonth: new Date(data.due_at + 'T12:00:00').toLocaleDateString('es-CL', {
        month: 'long', year: 'numeric',
      }),
    })
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }

  const campo = data.contact_1_at ? 'contact_2_at' : 'contact_1_at'
  await supabase
    .from('maintenance_schedule')
    .update({
      status: 'contacted',
      [campo]: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/mantenciones')
  return { success: true }
}

/**
 * Carga un trabajo YA REALIZADO (histórico), anterior al sistema actual.
 *
 * Diferencias con una reserva normal:
 *   · Entra directo como 'completed' — no pasa por el kanban
 *   · Acepta fechas pasadas y no valida disponibilidad de horario
 *   · **No envía ningún WhatsApp** al cliente ni al admin
 *   · Si es un cerámico, el trigger le programa la mantención a 6 meses
 */
export async function cargarTrabajoHistorico(input: {
  full_name: string
  phone: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year?: number
  vehicle_plate?: string
  vehicle_type: string
  service_id: string
  fecha: string          // YYYY-MM-DD
  total_price?: number
  notes?: string
}) {
  const supabase = createAdminClient()

  try {
    // ── Cliente (reusa el existente si el teléfono ya está) ──
    const raw = input.phone.replace(/\D/g, '')
    const telefono = raw.startsWith('56') ? raw : `56${raw}`

    let customerId: string
    const { data: existente } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq.${telefono},phone.eq.+${telefono},phone.eq.${raw}`)
      .maybeSingle()

    if (existente) {
      customerId = existente.id
    } else {
      const { data: nuevo, error: errCliente } = await supabase
        .from('customers')
        .insert({ full_name: input.full_name.trim(), phone: telefono })
        .select('id')
        .single()
      if (errCliente || !nuevo) {
        return { success: false, error: errCliente?.message ?? 'No se pudo crear el cliente' }
      }
      customerId = nuevo.id
    }

    // ── Vehículo ──
    // Se prueban los dos esquemas posibles de columnas.
    const anio = input.vehicle_year ?? new Date(input.fecha).getFullYear()
    const baseVehiculo = {
      customer_id: customerId,
      model: input.vehicle_model.trim(),
      year: anio,
      vehicle_type: input.vehicle_type,
    }

    let vehicleId: string | null = null
    let errVehiculo: string | null = null

    const variantes: Record<string, unknown>[] = [
      { ...baseVehiculo, brand: input.vehicle_make.trim(), plate: input.vehicle_plate ?? null },
      { ...baseVehiculo, make: input.vehicle_make.trim(), license_plate: input.vehicle_plate ?? null },
    ]

    for (const variante of variantes) {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(variante)
        .select('id')
        .single()
      if (!error && data) { vehicleId = data.id; errVehiculo = null; break }
      errVehiculo = error?.message ?? null
      // Si ya existe ese vehículo (patente repetida), lo buscamos
      if (error?.code === '23505' && input.vehicle_plate) {
        const { data: yaExiste } = await supabase
          .from('vehicles')
          .select('id')
          .eq('customer_id', customerId)
          .limit(1)
          .maybeSingle()
        if (yaExiste) { vehicleId = yaExiste.id; errVehiculo = null; break }
      }
    }

    if (!vehicleId) {
      return { success: false, error: `No se pudo registrar el vehículo: ${errVehiculo}` }
    }

    // ── Servicio y precio ──
    const { data: servicio, error: errServicio } = await supabase
      .from('services')
      .select('id, duration_hours, prices:service_prices(vehicle_type, price_clp)')
      .eq('id', input.service_id)
      .single()

    if (errServicio || !servicio) return { success: false, error: 'Servicio no encontrado' }

    const precioLista = (servicio.prices as { vehicle_type: string; price_clp: number }[] | null)
      ?.find(p => p.vehicle_type === input.vehicle_type)?.price_clp ?? 0

    // La tabla bookings usa booking_date + slot_start/slot_end (no scheduled_at)
    const minutos = Math.round((servicio.duration_hours ?? 1) * 60)
    const inicioMin = 10 * 60
    const finMin = inicioMin + minutos
    const hhmm = (m: number) =>
      `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:00`

    // ── Reserva histórica, directo a completada ──
    const { data: reserva, error: errReserva } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        vehicle_id: vehicleId,
        service_id: input.service_id,
        status: 'completed',
        booking_date: input.fecha,
        slot_start: hhmm(inicioMin),
        slot_end: hhmm(Math.min(finMin, 23 * 60 + 59)),
        total_price_clp: input.total_price ?? precioLista,
        customer_notes: input.notes?.trim() || 'Trabajo histórico cargado manualmente',
      })
      .select('id')
      .single()

    if (errReserva || !reserva) {
      return { success: false, error: errReserva?.message ?? 'No se pudo crear el registro' }
    }

    revalidatePath('/admin/kanban')
    revalidatePath('/admin/mantenciones')
    return { success: true, bookingId: reserva.id }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

/** Corre el motor completo a mano (útil para probar). */
export async function correrMotorMantenciones() {
  try {
    const reporte = await procesarMantenciones()
    revalidatePath('/admin/mantenciones')
    return { success: true, reporte }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
