import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const log: Record<string, unknown> = {}

  // 1. List all cookies
  try {
    const cookieStore = cookies()
    const all = cookieStore.getAll()
    log.all_cookie_names = all.map(c => c.name)
    log.auth_cookies = all.filter(c => c.name.startsWith('sb-') || c.name.includes('auth')).map(c => ({ name: c.name, hasValue: !!c.value }))
  } catch (e: any) {
    log.cookie_error = e?.message
  }

  // 2. Check session
  try {
    const supabase = createClient()
    const { data: { session }, error: sErr } = await supabase.auth.getSession()
    log.session = session ? `OK (user: ${session.user.email})` : `null (error: ${sErr?.message})`
    const { data: { user }, error: uErr } = await supabase.auth.getUser()
    log.user = user ? `OK (${user.email})` : `null (error: ${uErr?.message})`
  } catch (e: any) {
    log.auth_error = e?.message
  }

  // 3. Raw bookings
  try {
    const admin = createAdminClient()
    const { data, error, count } = await admin
      .from('bookings')
      .select('id, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10)
    log.bookings_raw = { count, error: error?.message, data }
  } catch (e: any) {
    log.admin_error = e?.message
  }

  return NextResponse.json(log, { headers: { 'Content-Type': 'application/json' } })
}
