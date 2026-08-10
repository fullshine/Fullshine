'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { sendRawMessage } from '@/lib/whatsapp'
import { BUSINESS } from '@/lib/seo'

/**
 * Reservas incompletas.
 *
 * Se guarda un borrador cuando alguien entrega sus datos de contacto pero
 * no llega a confirmar. Solo ocurre si aceptó el aviso del formulario, y
 * ese consentimiento queda registrado.
 */

export type Borrador = {
  id: string
  phone: string
  full_name: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  service_name: string | null
  booking_date: string | null
  slot_start: string | null
  paso_alcanzado: string | null
  estado: string
  contactado_at: string | null
  notas: string | null
  created_at: string
}

function normalizar(telefono: string): string {
  const raw = telefono.replace(/\D/g, '')
  return raw.startsWith('56') ? raw : `56${raw}`
}

/**
 * Guarda o actualiza el borrador. Se llama desde el formulario cuando el
 * usuario ya escribió nombre y teléfono.
 *
 * Nunca lanza error: si algo falla, la reserva del cliente debe continuar
 * igual. Esto es una función auxiliar, no puede bloquear la venta.
 */
export async function guardarBorrador(input: {
  phone: string
  full_name?: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_type?: string
  service_id?: string
  service_name?: string
  booking_date?: string
  slot_start?: string
  paso_alcanzado?: string
}): Promise<{ success: boolean }> {
  try {
    if (!input.phone || input.phone.replace(/\D/g, '').length < 8) {
      return { success: false }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('booking_drafts')
      .upsert(
        {
          phone: normalizar(input.phone),
          full_name: input.full_name?.trim() || null,
          vehicle_make: input.vehicle_make?.trim() || null,
          vehicle_model: input.vehicle_model?.trim() || null,
          vehicle_type: input.vehicle_type || null,
          service_id: input.service_id || null,
          service_name: input.service_name || null,
          booking_date: input.booking_date || null,
          slot_start: input.slot_start || null,
          paso_alcanzado: input.paso_alcanzado || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )

    if (error) {
      console.error('[guardarBorrador]', error.message)
      return { success: false }
    }
    return { success: true }
  } catch (e) {
    console.error('[guardarBorrador]', e)
    return { success: false }
  }
}

/**
 * Marca el borrador como convertido cuando la reserva sí se completa.
 * Se llama desde createBooking.
 */
export async function marcarConvertido(phone: string, bookingId: string) {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('booking_drafts')
      .update({
        estado: 'convertido',
        convertido_at: new Date().toISOString(),
        booking_id: bookingId,
        updated_at: new Date().toISOString(),
      })
      .eq('phone', normalizar(phone))
  } catch (e) {
    console.error('[marcarConvertido]', e)
  }
}

/** Listado para el panel: primero los que aún no se han trabajado. */
export async function getBorradores() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('booking_drafts')
    .select('*')
    .neq('estado', 'convertido')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return { success: false as const, error: error.message, data: [] as Borrador[] }
  return { success: true as const, data: (data ?? []) as Borrador[] }
}

export async function actualizarBorrador(
  id: string,
  cambios: { estado?: string; notas?: string }
) {
  const supabase = createAdminClient()
  const patch: Record<string, unknown> = { ...cambios, updated_at: new Date().toISOString() }
  if (cambios.estado === 'contactado') patch.contactado_at = new Date().toISOString()

  const { error } = await supabase.from('booking_drafts').update(patch).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/incompletas')
  return { success: true }
}

/** Envía el mensaje de recuperación y marca el borrador como contactado. */
export async function recuperarPorWhatsApp(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('booking_drafts')
    .select('*')
    .eq('id', id)
    .single<Borrador>()

  if (error || !data) return { success: false, error: 'No encontrado' }

  const nombre = data.full_name?.trim().split(' ')[0] ?? 'Hola'
  const vehiculo = `${data.vehicle_make ?? ''} ${data.vehicle_model ?? ''}`.trim()
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fullshine.autos'}/reservar`

  // Tono de ayuda, no de venta. Quien abandonó no quiere que le insistan:
  // quiere que le resuelvan lo que lo detuvo.
  const mensaje =
    `Hola ${nombre} 👋 Te escribo de *Fullshine*.\n\n` +
    `Vi que empezaste a agendar` +
    (data.service_name ? ` un *${data.service_name}*` : '') +
    (vehiculo ? ` para tu ${vehiculo}` : '') +
    ` y no alcanzaste a terminar.\n\n` +
    `¿Te quedó alguna duda o prefieres que te agende yo la hora? Dime qué día te acomoda y lo dejo listo en un minuto.\n\n` +
    `También puedes retomarlo acá: ${url}\n\n` +
    `Si ya no te interesa, dímelo sin problema y no te escribo más. 🙌`

  try {
    await sendRawMessage(data.phone, mensaje)
  } catch (e) {
    return { success: false, error: `WhatsApp falló: ${(e as Error).message}` }
  }

  await supabase
    .from('booking_drafts')
    .update({
      estado: 'contactado',
      contactado_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/incompletas')
  return { success: true, telefono: data.phone, negocio: BUSINESS.name }
}
