// Supabase Edge Function: send-reminders
// Deploy: supabase functions deploy send-reminders --no-verify-jwt
// CRON: every day at 9am Santiago time

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const META_TOKEN = Deno.env.get('META_WHATSAPP_TOKEN')!
const PHONE_NUMBER_ID = Deno.env.get('META_PHONE_NUMBER_ID')!

async function sendReminder(phone: string, customerName: string, serviceName: string, scheduledAt: string) {
  const date = new Date(scheduledAt)
  const formattedDate = date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  const formattedTime = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  const normalizedPhone = phone.replace(/\D/g, '')
  const to = normalizedPhone.startsWith('56') ? normalizedPhone : `56${normalizedPhone}`

  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${META_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: 'booking_reminder_client',
        language: { code: 'es' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: serviceName },
            { type: 'text', text: formattedDate },
            { type: 'text', text: formattedTime },
          ],
        }],
      },
    }),
  })
}

Deno.serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString()
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59).toISOString()

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, customer:customers(full_name, phone), service:services(name)')
      .gte('scheduled_at', tomorrowStart)
      .lte('scheduled_at', tomorrowEnd)
      .in('status', ['confirmed', 'pending'])

    let sent = 0
    for (const booking of bookings ?? []) {
      if (booking.customer?.phone) {
        await sendReminder(
          booking.customer.phone,
          booking.customer.full_name,
          booking.service?.name ?? '',
          booking.scheduled_at
        )
        sent++
      }
    }

    return new Response(JSON.stringify({ success: true, reminders_sent: sent }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
