'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmationToClient, sendNewBookingToAdmin } from '@/lib/whatsapp'
import type { CreateBookingInput, ActionResult, AvailableSlotsResult, TimeSlot } from '@/types'

const BUSINESS_HOURS = {
  weekday: { open: 8, close: 18 },
  saturday: { open: 8, close: 14 },
}

export async function createBooking(input: CreateBookingInput): Promise<ActionResult<{ bookingId: string }>> {
  try {
    const supabase = createAdminClient()

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

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, prices:service_prices(vehicle_type, price_clp)')
      .eq('id', input.service_id)
      .eq('active', true)
      .single()

    if (serviceError || !service) {
      return { success: false, error: 'Servicio no encontrado' }
    }

    const durationMinutes = Math.round((service.duration_hours || 1) * 60)
    const scheduledAt = new Date(input.scheduled_at)
    const estimatedEndAt = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000)

    const priceRecord = service.prices?.find(
      (p: { vehicle_type: string; price_clp: number }) => p.vehicle_type === input.vehicle.vehicle_type
    )
    const totalPrice = priceRecord?.price_clp ?? 0

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
        return { success: false, error: 'El horario seleccionado ya no está disponible.' }
      }
      return { success: false, error: 'Error al crear la reserva' }
    }

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

    return