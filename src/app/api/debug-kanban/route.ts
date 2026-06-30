import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const log: Record<string, unknown> = {}

  // 1. Check session
  try {
    const supabase = createClient()
    const { data: { session }, error: sErr } = await supabase.auth.getSession()
    log.session = session ? `OK (user: ${session.user.email})` : `null (error: ${sErr?.message})`

    const { data: { user }, error: uErr } = await supabase.auth.getUser()
    log.user = user ? `OK (${user.email})` : `null (error: ${uErr?.message})`
  } catch (e: any) {
    log.auth_error = e?.message
  }

  // 2. Raw query with admin client
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

  // 3. Query with NOT filter
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('bookings')
      .select('id, status')
      .not('status', 'eq', 'cancelled')
    log.bookings_filtered = { count: data?.length, error: error?.message, statuses: data?.map(b => b.status) }
  } catch (e: any) {
    log.filter_error = e?.message
  }

  return NextResponse.json(log)
}
