'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmationToClient, sendNewBookingToAdmin } from '@/lib/whatsapp'
import type { CreateBookingInput, ActionResult, AvailableSlotsResult, TimeSlot } from '@/types'

// Horario de atención: Lunes-Viernes 8:00-18:00, Sábados 8:00-14:00
const BUSINESS_HOURS = {
  weekday: { open: 8, close: 18 },
  saturday: { open: 8, close: 14 },
}

export async function createBooking(input: CreateBookingInput): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const supabase = createAdminClient()

    // 1. Upsert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { full_name: input.customer.full_name, phone: input.customer.phone, email: input.customer.email },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Error al registrar cliente' }
    }

    // 2. Upsert vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .upsert(
        {
          customer_id: customer.id,
          make: input.vehicle.make,
          model: input.vehicle.model,
          year: input.vehicle.year,
          color: input.vehicle.color,
          license_plate: input.vehicle.license_plate,
          vehicle_type: input.vehicle.vehicle_type,
        },
        { onConflict: 'customer_id,license_plate', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (vehicleError || !vehicle) {
      return { success: false, error: 'Error al registrar vehículo' }
    }

    // 3. Get service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, prices:service_prices(vehicle_type, price)')
      .eq('id', input.service_id)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    const scheduledAt = new Date(input.scheduled_at)
    const estimatedEndAt = new Date(scheduledAt.getTime() + service.duration_minutes * 60 * 1000)

    // 4. Get price for vehicle type
    const priceRecord = service.prices?.find(
      (p: { vehicle_type: string; price: number }) => p.vehicle_type === input.vehicle.vehicle_type
    )
    const totalPrice = priceRecord?.price ?? 0

    // 5. Atomic booking via PostgreSQL function (anti-double-booking)
    const { data: bookingResult, error: bookingError } = await supabase.rpc('create_booking_atomic', {
      p_customer_id: customer.id,
      p_vehicle_id: vehicle.id,
      p_service_id: input.service_id,
      p_scheduled_at: input.scheduled_at,
      p_estimated_end_at: estimatedEndAt.toISOString(),
      p_total_price: totalPrice,
      p_notes: input.notes ?? null,
    })

    if (bookingError || !bookingResult) {
      if (bookingError?.message?.includes('overlap') || bookingError?.message?.includes('slot')) {
        return { success: false, error: 'El horario seleccionado ya no está disponible. Por favor elige otro.' }
      }
      return { success: false, error: 'Error al crear la reserva' }
    }

    const bookingId = bookingResult as string

    // 6. Send WhatsApp notifications (non-blocking)
    Promise.all([
      sendBookingConfirmationToClient({
        phone: input.customer.phone,
        customerName: input.customer.full_name,
        serviceName: service.name,
        scheduledAt: input.scheduled_at,
        vehicleMake: input.vehicle.make,
        vehicleModel: input.vehicle.model,
      }),
      sendNewBookingToAdmin({
        customerName: input.customer.full_name,
        customerPhone: input.customer.phone,
        serviceName: service.name,
        scheduledAt: input.scheduled_at,
        vehicleMake: input.vehicle.make,
        vehicleModel: input.vehicle.model,
        vehicleLicensePlate: input.vehicle.license_plate,
      }),
    ]).catch(console.error)

    return { success: true, data: { bookingId } }
  } catch (error) {
    console.error('createBooking error:', error)
    return { success: false, error: 'Error inesperado al crear la reserva' }
  }
}

export async function getAvailableSlots(date: string, serviceId: string): Promise<ActionResult<AvailableSlotsResult>> {
  try {
    const supabase = createAdminClient()

    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()

    if (!service) return { success: false, error: 'Servicio no encontrado' }

    const dayOfWeek = new Date(date + 'T12:00:00').getDay() // avoid TZ issues
    if (dayOfWeek === 0) {
      // Sunday - closed
      return { success: true, data: { date, slots: [] } }
    }

    const hours = dayOfWeek === 6 ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekday
    const durationMinutes = service.duration_minutes
    const slotIntervalMinutes = 30

    // Generate all possible slots
    const allSlots: TimeSlot[] = []
    for (let h = hours.open; h < hours.close; h++) {
      for (let m = 0; m < 60; m += slotIntervalMinutes) {
        const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000)
        const closeTime = new Date(`${date}T${String(hours.close).padStart(2, '0')}:00:00`)

        if (slotEnd <= closeTime) {
          allSlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: true,
          })
        }
      }
    }

    // Get existing bookings for that day
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('scheduled_at, estimated_end_at')
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .not('status', 'in', '("cancelled")')

    // Mark overlapping slots as unavailable
    const slots = allSlots.map((slot) => {
      const slotStart = new Date(slot.start)
      const slotEnd = new Date(slot.end)
      const hasOverlap = existingBookings?.some((booking) => {
        const bookingStart = new Date(booking.scheduled_at)
        const bookingEnd = new Date(booking.estimated_end_at)
        return slotStart < bookingEnd && slotEnd > bookingStart
      })
      return { ...slot, available: !hasOverlap }
    })

    return { success: true, data: { date, slots } }
  } catch (error) {
    console.error('getAvailableSlots error:', error)
    return { success: false, error: 'Error al consultar disponibilidad' }
  }
}

export async function getServices(): Promise<ActionResult<Array<{
  id: string; name: string; description?: string; category: string;
  duration_minutes: number; prices: Array<{ vehicle_type: string; price: number }>
}>>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, category, duration_minutes, prices:service_prices(vehicle_type, price)')
      .eq('is_active', true)
      .order('category')
      .order('name')

    if (error) return { success: false, error: 'Error al cargar servicios' }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}
