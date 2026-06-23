import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/gcal/oauth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/admin/dashboard?gcal=error', request.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const supabase = createAdminClient()

    // Store tokens in settings table for the Edge Functions to use
    await supabase.from('settings').upsert({
      key: 'gcal_tokens',
      value: JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
      }),
    }, { onConflict: 'key' })

    return NextResponse.redirect(new URL('/admin/dashboard?gcal=connected', request.url))
  } catch (err) {
    console.error('GCal OAuth error:', err)
    return NextResponse.redirect(new URL('/admin/dashboard?gcal=error', request.url))
  }
}
