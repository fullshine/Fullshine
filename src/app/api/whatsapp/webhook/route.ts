import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? 'fullshine_webhook_2024'

// GET: webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: incoming messages (read receipts, status updates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Log incoming webhooks for debugging
    console.log('WhatsApp webhook:', JSON.stringify(body, null, 2))
    // Process status updates if needed
    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
