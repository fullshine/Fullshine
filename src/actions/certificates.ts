'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendCertificateToClient } from '@/lib/whatsapp'

export async function generateCertificate(bookingId: string) {
  try {
    const supabase = createAdminClient()

    // Obtener datos de la reserva
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(full_name, phone),
        vehicle:vehicles(brand, model, plate),
        service:services(name, category)
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }

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

    // Generar código único: FS-2025-0042
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
    const seq = ((count ?? 0) + 1).toString().padStart(4, '0')
    const code = `FS-${year}-${seq}`

    const appliedAt = booking.booking_date
    const expiresAt = new Date(appliedAt)
    expiresAt.setFullYear(expiresAt.getFullYear() + 3)
    const expiresAtStr = expiresAt.toISOString().split('T')[0]

    // Crear certificado
    const { error: insertError } = await supabase
      .from('certificates')
      .insert({
        booking_id:       bookingId,
        certificate_code: code,
        customer_name:    booking.customer?.full_name ?? 'Cliente',
        vehicle_brand:    booking.vehicle?.brand ?? '',
        vehicle_model:    booking.vehicle?.model ?? '',
        vehicle_plate:    booking.vehicle?.plate ?? null,
        service_name:     booking.service?.name ?? '',
        product_name:     'Nasiol ZR53',
        applied_at:       appliedAt,
        warranty_years:   3,
        expires_at:       expiresAtStr,
      })

    if (insertError) return { success: false, error: insertError.message }

    // Enviar WhatsApp al cliente
    const certUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fullshine.autos'}/certificado/${code}`

    if (booking.customer?.phone) {
      sendCertificateToClient({
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
