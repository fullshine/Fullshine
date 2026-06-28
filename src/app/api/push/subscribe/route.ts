import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json()
    const supabase = createAdminClient()
    await supabase.from('push_subscriptions').upsert(
      { endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) },
      { onConflict: 'endpoint' }
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
