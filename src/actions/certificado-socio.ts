'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { esCategoriaPrivada } from '@/lib/servicios'
import { folioCertificado, codigoGift, horasDeReserva } from '@/lib/certificado'
import type { DatosCertificado } from '@/lib/certificado'
import type { ActionResult } from '@/types'

/**
 * Datos del certificado de preparación de un vehículo de convenio.
 *
 * El folio se calcula contando los certificados emitidos del año. No es
 * perfecto si se emiten dos a la vez, pero para el volumen real (cinco a
 * siete autos al mes) sobra y evita una tabla de correlativos.
 */

async function requiereAdmin(): Promise<boolean> {
  return cookies().getAll().some(c =>
    c.value && (
      (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
      c.name === 'supabase-auth-token'
    )
  )
}

export async function getDatosCertificado(
  bookingId: string
): Promise<ActionResult<DatosCertificado & { aviso: string | null }>> {
  if (!(await requiereAdmin())) {
    return { success: false, error: 'Sesión expirada. Vuelve a entrar.' }
  }

  try {
    const supabase = createAdminClient()

    const { data: b, error } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicles(*), service:services(name, category), customer:customers(full_name)')
      .eq('id', bookingId)
      .single()

    if (error || !b) return { success: false, error: 'Reserva no encontrada' }

    const plan = b.service?.name ?? 'Servicio'
    if (!esCategoriaPrivada(b.service?.category)) {
      return { success: false, error: 'El certificado es solo para servicios de convenio.' }
    }

    const v = b.vehicle as Record<string, unknown> | null
    const patente = ((v?.plate ?? v?.license_plate ?? '') as string).toUpperCase() || null

    // Correlativo del año según los certificados ya subidos al portal.
    const anio = new Date().getFullYear()
    const { count } = await supabase
      .from('partner_documents')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'informe')
      .gte('created_at', `${anio}-01-01`)

    const folio = folioCertificado(anio, (count ?? 0) + 1)

    // Sin patente el certificado sale igual, pero el socio no va a poder
    // encontrarlo en su portal, que agrupa por vehículo.
    const aviso = patente
      ? null
      : 'Este vehículo no tiene patente registrada. Agrégala antes de subir el certificado, o el socio no podrá encontrarlo.'

    return {
      success: true,
      data: {
        folio,
        emitido: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
        socio: b.customer?.full_name ?? 'Automotora',
        marca: ((v?.brand ?? v?.make ?? '') as string) || '—',
        modelo: ((v?.model ?? '') as string) || '—',
        anio: (v?.year as number) ?? null,
        color: ((v?.color ?? '') as string) || null,
        patente,
        plan,
        preparadoEl: b.booking_date ?? '',
        horas: horasDeReserva(b.slot_start, b.slot_end),
        codigoGift: codigoGift(folio),
        aviso,
      },
    }
  } catch (e) {
    console.error('[getDatosCertificado]', e)
    return { success: false, error: 'Error al preparar el certificado' }
  }
}

/**
 * Certificado a partir de un documento ya cargado en el portal.
 *
 * Es el camino que se usa desde la lista de facturas: la factura trae la
 * patente, y con esa patente se busca la reserva de convenio del vehículo
 * para llenar marca, modelo, año y plan. Si no hay reserva que calce —pasa
 * con los autos cargados antes del sistema— el certificado igual se emite
 * con lo que tiene la factura, y se avisa qué quedó incompleto.
 */
export async function getCertificadoDeDocumento(
  docId: string
): Promise<ActionResult<DatosCertificado & { aviso: string | null }>> {
  if (!(await requiereAdmin())) {
    return { success: false, error: 'Sesión expirada. Vuelve a entrar.' }
  }

  try {
    const supabase = createAdminClient()

    const { data: doc, error } = await supabase
      .from('partner_documents')
      .select('*, partner:partners(name)')
      .eq('id', docId)
      .single()

    if (error || !doc) return { success: false, error: 'Documento no encontrado' }

    const patente = (doc.patente ?? '').toUpperCase() || null
    if (!patente) {
      return { success: false, error: 'Esta factura no tiene patente, así que no se puede identificar el vehículo.' }
    }

    // Buscar el vehículo por patente y, desde ahí, su reserva de convenio.
    const { data: autos } = await supabase
      .from('vehicles')
      .select('id, brand, model, year, color, plate')
      .ilike('plate', patente)

    let reserva: Record<string, unknown> | null = null
    let auto = (autos ?? [])[0] as Record<string, unknown> | undefined

    if (auto) {
      const { data: bs } = await supabase
        .from('bookings')
        .select('booking_date, slot_start, slot_end, service:services(name, category)')
        .eq('vehicle_id', auto.id as string)
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: false })

      reserva = ((bs ?? []).find(b =>
        esCategoriaPrivada((b.service as unknown as { category?: string } | null)?.category)
      ) ?? null) as Record<string, unknown> | null
    }

    const servicio = reserva?.service as unknown as { name?: string } | undefined
    const plan = servicio?.name ?? 'Plan Pulido + Interior'

    // Nombre del vehículo: el del registro, o lo que diga el título de la
    // factura quitándole la palabra "Factura".
    const desdeTitulo = (doc.titulo as string).replace(/^\s*factura\s*/i, '').trim()

    const anio = new Date().getFullYear()
    const { count } = await supabase
      .from('partner_documents')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'informe')
      .gte('created_at', `${anio}-01-01`)

    const folio = folioCertificado(anio, (count ?? 0) + 1)

    const faltantes: string[] = []
    if (!auto) faltantes.push('no hay un vehículo registrado con esa patente')
    else if (!reserva) faltantes.push('el vehículo no tiene una reserva de convenio asociada')

    return {
      success: true,
      data: {
        folio,
        emitido: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }),
        socio: (doc.partner as { name?: string } | null)?.name ?? 'Automotora',
        marca: (auto?.brand as string) || desdeTitulo || '—',
        modelo: auto ? ((auto.model as string) ?? '') : '',
        anio: (auto?.year as number) ?? null,
        color: (auto?.color as string) || null,
        patente,
        plan,
        preparadoEl: (reserva?.booking_date as string)
          ?? (doc.periodo as string | null)
          ?? (doc.created_at as string).substring(0, 10),
        horas: horasDeReserva(
          reserva?.slot_start as string | null,
          reserva?.slot_end as string | null
        ),
        codigoGift: codigoGift(folio),
        aviso: faltantes.length
          ? `Datos incompletos: ${faltantes.join(' y ')}. El certificado usa el plan "${plan}" por defecto — revísalo antes de entregarlo.`
          : null,
      },
    }
  } catch (e) {
    console.error('[getCertificadoDeDocumento]', e)
    return { success: false, error: 'Error al preparar el certificado' }
  }
}

/** Reservas de convenio que pueden generar certificado. */
export async function getReservasConvenio(): Promise<ActionResult<{
  id: string
  fecha: string
  estado: string
  plan: string
  vehiculo: string
  patente: string | null
  socio: string
}[]>> {
  if (!(await requiereAdmin())) {
    return { success: false, error: 'Sesión expirada. Vuelve a entrar.' }
  }

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .select('id, booking_date, status, vehicle:vehicles(*), service:services(name, category), customer:customers(full_name)')
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: false })

    if (error) return { success: false, error: error.message }

    const filas = (data ?? [])
      .filter(b => esCategoriaPrivada((b.service as { category?: string } | null)?.category))
      .map(b => {
        // El tipo generado por Supabase da array para la relación; en la
        // práctica viene un objeto, por eso el doble cast.
        const v = b.vehicle as unknown as Record<string, unknown> | null
        return {
          id: b.id,
          fecha: b.booking_date ?? '',
          estado: b.status,
          plan: (b.service as { name?: string } | null)?.name ?? '—',
          vehiculo: [v?.brand ?? v?.make, v?.model, v?.year].filter(Boolean).join(' '),
          patente: ((v?.plate ?? v?.license_plate ?? '') as string).toUpperCase() || null,
          socio: (b.customer as { full_name?: string } | null)?.full_name ?? '—',
        }
      })

    return { success: true, data: filas }
  } catch {
    return { success: false, error: 'Error al cargar las reservas de convenio' }
  }
}
