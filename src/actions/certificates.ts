'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendCertificateToClient } from '@/lib/whatsapp'

export async function generateCertificate(bookingId: string) {
  try {
    const supabase = createAdminClient()

    // Obtener datos de la reserva
    // OJO: la tabla vehicles usa make / license_plate (no brand / plate)
    // y la fecha de la cita vive en bookings.scheduled_at.
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id, scheduled_at,
        customer:customers(full_name, phone),
        vehicle:vehicles(make, model, license_plate),
        service:services(name, category)
      `)
      .eq('id', bookingId)
      .single<{
        id: string
        scheduled_at: string
        customer: { full_name: string; phone: string } | null
        vehicle: { make: string; model: string; license_plate: string | null } | null
        service: { name: string; category: string } | null
      }>()

    if (error) {
      console.error('[generateCertificate] consulta:', error.message)
      return { success: false, error: `No se pudo leer la reserva: ${error.message}` }
    }
    if (!booking) return { success: false, error: 'Reserva no encontrada' }

    // Solo para tratamientos cerámicos
    if (booking.service?.category !== 'ceramico') {
      return { success: true, skipped: true }
    }

    // Verificar si ya tiene certificado
    const { data: existing } = await supabase
      .from('certificates')
      .select('certificate_code')
      .eq('booking_id', bookingId)
      .maybeSingle()

    if (existing) {
      return { success: true, code: existing.certificate_code, already_existed: true }
    }

    // Fecha de aplicación = fecha de la cita (o hoy, si viniera vacía)
    const appliedDate = booking.scheduled_at ? new Date(booking.scheduled_at) : new Date()
    if (Number.isNaN(appliedDate.getTime())) {
      return { success: false, error: 'La reserva no tiene una fecha válida' }
    }
    const appliedAtStr = appliedDate.toISOString().split('T')[0]

    const expiresDate = new Date(appliedDate)
    expiresDate.setFullYear(expiresDate.getFullYear() + 3)
    const expiresAtStr = expiresDate.toISOString().split('T')[0]

    // Código correlativo FS-2026-0042.
    // Si el código ya existe (por certificados borrados o carrera entre
    // dos generaciones simultáneas), se prueba el siguiente número.
    const year = appliedDate.getFullYear()
    const { count } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })

    let code = ''
    let insertError: { message: string } | null = null

    for (let intento = 0; intento < 20; intento++) {
      const seq = ((count ?? 0) + 1 + intento).toString().padStart(4, '0')
      code = `FS-${year}-${seq}`

      const { error: err } = await supabase
        .from('certificates')
        .insert({
          booking_id:       bookingId,
          certificate_code: code,
          customer_name:    booking.customer?.full_name ?? 'Cliente',
          vehicle_brand:    booking.vehicle?.make ?? '',
          vehicle_model:    booking.vehicle?.model ?? '',
          vehicle_plate:    booking.vehicle?.license_plate ?? null,
          service_name:     booking.service?.name ?? '',
          product_name:     'Nasiol ZR53',
          applied_at:       appliedAtStr,
          warranty_years:   3,
          expires_at:       expiresAtStr,
        })

      if (!err) { insertError = null; break }
      // 23505 = violación de unicidad → el código ya estaba tomado
      if ((err as { code?: string }).code !== '23505') { insertError = err; break }
      insertError = err
    }

    if (insertError) {
      console.error('[generateCertificate] insert:', insertError.message)
      return { success: false, error: insertError.message }
    }

    // Enviar WhatsApp al cliente.
    // Debe ir AWAIT: en Vercel la función se congela al retornar y una
    // promesa suelta nunca alcanza a ejecutarse.
    const certUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fullshine.autos'}/certificado/${code}`

    if (booking.customer?.phone) {
      await sendCertificateToClient({
        phone:        booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName:  booking.service?.name ?? '',
        certCode:     code,
        certUrl,
        expiresAt:    expiresAtStr,
      }).catch(e => console.error('[WhatsApp certificado]', e?.message))
    }

    return { success: true, code, certUrl }
  } catch (err: any) {
    console.error('[generateCertificate]', err)
    return { success: false, error: err?.message ?? 'Error inesperado' }
  }
}

export async function getCertificate(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_code', code)
    .single()

  if (error || !data) return null
  return data
}
