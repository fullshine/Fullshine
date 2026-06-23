// Supabase Edge Function: delete-gcal-event
// Deploy: supabase functions deploy delete-gcal-event --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

Deno.serve(async (req) => {
  try {
    const { gcal_event_id } = await req.json()
    if (!gcal_event_id) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_event_id' }), { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: tokensSetting } = await supabase
      .from('settings').select('value').eq('key', 'gcal_tokens').single()

    if (!tokensSetting) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_tokens' }), { status: 200 })
    }

    const tokens = JSON.parse(tokensSetting.value)
    let accessToken = tokens.access_token

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
    }

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcal_event_id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
    )

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('delete-gcal-event error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
