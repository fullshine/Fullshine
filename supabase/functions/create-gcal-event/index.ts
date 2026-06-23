// Supabase Edge Function: create-gcal-event
// Deploy: supabase functions deploy create-gcal-event --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

Deno.serve(async (req) => {
  try {
    const { booking_id } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch booking with relations
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(full_name, phone),
        vehicle:vehicles(make, model, year, license_plate, vehicle_type),
        service:services(name, duration_minutes)
      `)
      .eq('id', booking_id)
      .single()

    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 })
    }

    // Get stored tokens
    const { data: tokensSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'gcal_tokens')
      .single()

    if (!tokensSetting) {
      console.log('No Google Calendar tokens configured, skipping')
      return new Response(JSON.stringify({ skipped: true, reason: 'no_tokens' }), { status: 200 })
    }

    const tokens = JSON.parse(tokensSetting.value)
    let accessToken = tokens.access_token

    // Refresh token if expired
    if (Date.now() > tokens.expires_at - 60000) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      const newTokens = await refreshRes.json()
      accessToken = newTokens.access_token
      await supabase.from('settings').update({
        value: JSON.stringify({ ...tokens, access_token: accessToken, expires_at: Date.now() + newTokens.expires_in * 1000 }),
      }).eq('key', 'gcal_tokens')
    }

    // Create Google Calendar event
    const event = {
      summary: `${booking.service.name} - ${booking.customer.full_name}`,
      description: [
        `Cliente: ${booking.customer.full_name}`,
        `Teléfono: ${booking.customer.phone}`,
        `Vehículo: ${booking.vehicle.make} ${booking.vehicle.model} ${booking.vehicle.year}`,
        booking.vehicle.license_plate ? `Patente: ${booking.vehicle.license_plate}` : '',
        booking.notes ? `Notas: ${booking.notes}` : '',
      ].filter(Boolean).join('\n'),
      start: { dateTime: booking.scheduled_at, timeZone: 'America/Santiago' },
      end: { dateTime: booking.estimated_end_at, timeZone: 'America/Santiago' },
      colorId: '5', // banana color for bookings
    }

    const gcalRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    const gcalEvent = await gcalRes.json()

    if (gcalEvent.id) {
      await supabase.from('bookings').update({ gcal_event_id: gcalEvent.id }).eq('id', booking_id)
    }

    return new Response(JSON.stringify({ success: true, event_id: gcalEvent.id }), { status: 200 })
  } catch (err) {
    console.error('create-gcal-event error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
