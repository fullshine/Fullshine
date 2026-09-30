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
