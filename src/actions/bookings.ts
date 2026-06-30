'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmationToClient, sendNewBookingToAdmin } from '@/lib/whatsapp'
import { sendPushToAdmin } from '@/lib/push'
import type { CreateBookingInput, ActionResult, AvailableSlotsResult, TimeSlot, Service } from '@/types'

const BUSINESS_HOURS = {
  weekday: { open: 8, close: 18 },
  saturday: { open: 8, close: 14 },
}

const FIXED_SLOTS = [
  { hour: 9, minute: 0 },
  { hour: 14, minute: 0 },
]

const MAX_CONCURRENT = 1
const FULL_DAY_THRESHOLD_MINUTES = 6 * 60

// --- SERVICES ---

export async function getServices(): Promise<ActionResult<Service[]>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select('*, prices:service_prices(*)')
      .order('category')
      .order('name')
    if (error) return { success: false, error: error.message }
    return { success: true, data: (data ?? []) as Service[] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- AVAILABLE SLOTS ---

export async function getAvailableSlots(date: string, serviceId: string): Promise<ActionResult<AvailableSlotsResult>> {
  try {
    const supabase = createAdminClient()

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_hours')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) return { success: false, error: 'Servicio no encontrado' }

    const durationMinutes = Math.round((service.duration_hours ?? 1) * 60)

    const { data: bookings } = await supabase
      .from('bookings')
      .select('slot_start, slot_end')
      .eq('booking_date', date)
      .not('status', 'eq', 'cancelled')

    const dayOfWeek = new Date(`${date}T12:00:00`).getDay()
    if (dayOfWeek === 0) return { success: true, data: { date, slots: [] } }

    const hours = dayOfWeek === 6 ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekday
    const slots: TimeSlot[] = []
    const isFullDay = durationMinutes > FULL_DAY_THRESHOLD_MINUTES

    for (const fixed of FIXED_SLOTS) {
      if (isFullDay && fixed.hour >= 12) continue

      const startMinutes = fixed.hour * 60 + fixed.minute
      const endMinutes = startMinutes + durationMinutes

      if (!isFullDay && endMinutes > hours.close * 60) continue

      const sh = fixed.hour.toString().padStart(2, '0')
      const sm = fixed.minute.toString().padStart(2, '0')
      const eh = Math.floor(endMinutes / 60).toString().padStart(2, '0')
      const emin = (endMinutes % 60).toString().padStart(2, '0')

      const slotStartTime = `${sh}:${sm}:00`
      const slotEndTime = `${eh}:${emin}:00`

      const overlappingCount = (bookings ?? []).filter((b: any) =>
        b.slot_start < slotEndTime && b.slot_end > slotStartTime
      ).length

      const spotsLeft = MAX_CONCURRENT - overlappingCount

      slots.push({
        start: `${date}T${slotStartTime}`,
        end: `${date}T${slotEndTime}`,
        available: spotsLeft > 0,
        spots_left: Math.max(0, spotsLeft),
      })
    }

    return { success: true, data: { date, slots } }
  } catch {
    return { success: false, error: 'Error al cargar horarios' }
  }
}

// --- BOOKINGS ---

export async function createBooking(input: CreateBookingInput): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const supabase = createAdminClient()

    const rawPhone = input.customer.phone.replace(/\D/g, '')
    const normalizedPhone = rawPhone.startsWith('56') ? rawPhone : `56${rawPhone}`

    let customer: { id: string; full_name: string; phone: string } | null = null
    const { data: existing } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .or(`phone.eq.${normalizedPhone},phone.eq.+${normalizedPhone},phone.eq.${rawPhone}`)
      .maybeSingle()

    if (existing) {
      customer = existing
    } else {
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ full_name: input.customer.full_name, phone: normalizedPhone, email: input.customer.email ?? null })
        .select('id, full_name, phone')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: fallback } = await supabase
            .from('customers')
            .select('id, full_name, phone')
            .or(`phone.eq.${normalizedPhone},phone.eq.+${normalizedPhone},phone.eq.${rawPhone}`)
            .maybeSingle()
          if (fallback) {
            customer = fallback
          } else {
            return { success: false, error: insertError.message }
          }
        } else {
          return { success: false, error: insertError.message }
        }
      } else if (!newCustomer) {
        return { success: false, error: 'Error al registrar cliente' }
      } else {
        customer = newCustomer
      }
    }

    let vehicle: { id: string } | null = null
    if (input.vehicle.license_plate) {
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('license_plate', input.vehicle.license_plate)
        .maybeSingle()
      if (existingVehicle) vehicle = existingVehicle
    }

    if (!vehicle) {
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          customer_id: customer.id,
          make: input.vehicle.make,
          model: input.vehicle.model,
          year: input.vehicle.year,
          color: input.vehicle.color ?? null,
          license_plate: input.vehicle.license_plate ?? null,
          vehicle_type: input.vehicle.vehicle_type,
        })
        .select('id')
        .single()
      if (vehicleError || !newVehicle) {
        return { success: false, error: vehicleError?.message ?? 'Error al registrar vehículo' }
      }
      vehicle = newVehicle
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, prices:service_prices(*)')
      .eq('id', input.service_id)
      .single()

    if (serviceError || !service) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    const durationMinutes = Math.round((service.duration_hours ?? 1) * 60)
    const bookingDate = input.scheduled_at.substring(0, 10)
    const slotStartTime = input.scheduled_at.substring(11, 19)
    const startMinutes = parseInt(slotStartTime.substring(0, 2)) * 60 + parseInt(slotStartTime.substring(3, 5))
    const endMinutes = startMinutes + durationMinutes
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0')
    const endM = (endMinutes % 60).toString().padStart(2, '0')
    const slotEndTime = `${endH}:${endM}:00`

    const priceRecord = service.prices?.find(
      (p: any) => p.vehicle_type === input.vehicle.vehicle_type
    )
    const totalPrice = priceRecord?.price_clp ?? 0

    const { data: overlapping } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', bookingDate)
      .neq('status', 'cancelled')
      .lt('slot_start', slotEndTime)
      .gt('slot_end', slotStartTime)

    if (overlapping && overlapping.length >= MAX_CONCURRENT) {
      return { success: false, error: 'El horario seleccionado ya no está disponible.' }
    }

    const { data: bookingResult, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        service_id: input.service_id,
        booking_date: bookingDate,
        slot_start: slotStartTime,
        slot_end: slotEndTime,
        total_price_clp: totalPrice,
        customer_notes: input.notes ?? null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (bookingError || !bookingResult) {
      return { success: false, error: bookingError?.message ?? 'Error al crear la reserva' }
    }

    const bookingId = bookingResult.id

    // Generar link de pago Flow si hay precio
    let paymentLink: string | undefined
    if (totalPrice > 0) {
      try {
        const { createPaymentLink } = await import('@/lib/flow')
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fullshine.autos'
        const orderId = `FS-${bookingId.substring(0, 8)}-${Date.now()}`
        const amount = Math.round(totalPrice * 0.2)
        const result = await createPaymentLink({
          orderId,
          amount,
          subject: `Anticipo Fullshine - ${service.name}`,
          customerEmail: input.customer.email ?? undefined,
          urlReturn: `${baseUrl}/reservar/pago-exitoso`,
          urlConfirmation: `${baseUrl}/api/flow/webhook`,
        })
        paymentLink = result.url
        // Guardar link en la reserva
        await supabase.from('bookings').update({
          payment_link: paymentLink,
          payment_amount: amount,
          flow_order_id: orderId,
          status: 'payment_sent',
        }).eq('id', bookingId)
      } catch (flowErr: any) {
        const flowErrMsg = flowErr?.message ?? String(flowErr)
        console.error('[Flow] No se pudo crear link de pago:', flowErrMsg)
        // Notificar al admin del error para debug
        await sendNewBookingToAdmin({
          customerName: `⚠️ ERROR FLOW: ${flowErrMsg}`,
          customerPhone: input.customer.phone,
          serviceName: service.name,
          scheduledAt: input.scheduled_at,
          vehicleMake: input.vehicle.make ?? '',
          vehicleModel: input.vehicle.model,
          vehicleLicensePlate: input.vehicle.license_plate ?? '',
        }).catch(() => {})
      }
    }

    // WhatsApp: fallar silenciosamente si Green API no está disponible
    Promise.all([
      sendBookingConfirmationToClient({
        phone: input.customer.phone,
        customerName: input.customer.full_name,
        serviceName: service.name,
        scheduledAt: input.scheduled_at,
        vehicleMake: input.vehicle.make ?? '',
        vehicleModel: input.vehicle.model,
        totalPrice,
        paymentLink,
      }).catch(e => console.error('[WhatsApp cliente]', e?.message)),
      sendNewBookingToAdmin({
        customerName: input.customer.full_name,
        customerPhone: input.customer.phone,
        serviceName: service.name,
        scheduledAt: input.scheduled_at,
        vehicleMake: input.vehicle.make ?? '',
        vehicleModel: input.vehicle.model,
      }).catch(e => console.error('[WhatsApp admin]', e?.message)),
    ])

    return { success: true, data: { bookingId } }
  } catch (err: any) {
    console.error('[createBooking] unexpected error:', err)
    return { success: false, error: err?.message ?? 'Error inesperado' }
  }
}
