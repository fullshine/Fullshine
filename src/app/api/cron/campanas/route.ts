import { NextRequest, NextResponse } from 'next/server'
import { dispatchCampaignMessages } from '@/lib/campaigns/server'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try { return NextResponse.json(await dispatchCampaignMessages()) }
  catch { return NextResponse.json({ error: 'No se pudo procesar la cola' }, { status: 503 }) }
}
