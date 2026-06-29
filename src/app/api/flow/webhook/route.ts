import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

const SECRET_KEY = process.env.FLOW_SECRET_KEY!
const API_KEY = process.env.FLOW_API_KEY!
const FLOW_API_URL = 'https://www.flow.cl/api'

// Verificar firma HMAC de Flow — igual al sign() de flow.ts
function verifySignature(params: Record<string, string>): boolean {
  const { s, ...rest } = params
  if (!s) return false
  const sorted = Object.keys(rest).sort().map(k => `${k}${rest[k]}`).join('')
  const expected = crypto.createHmac('sha256', SECRET_KEY).update(sorted).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))
}

// Consultar estado del pago en Flow
async function getPaymentStatus(token: string) {
  const params: Record<string, string> = { apiKey: API_KEY, token }
  const sorted = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  const s = crypto.createHmac('sha256', SECRET_KEY).update(sorted).digest('hex')

  const url = new URL(`${FLOW_API_URL}/payment/getStatus`)
  url.searchParams.set('apiKey', API_KEY)
  url.searchParams.set('token', token)
  url.searchParams.set('s', s)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Flow getStatus error: ${res.status}`)
  return res.json()
}

// Flow envía POST con form-urlencoded al confirmar un pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = Object.fromEntries(new URLSearchParams(body))

    // 1. Verificar firma HMAC
    if (!verifySignature(params)) {
      console.error('[flow/webhook] Firma inválida:', params)
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const token = params.token
    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 })
    }

    // 2. Consultar estado real del pago en Flow
    const payment = await getPaymentStatus(token)
    console.log('[flow/webhook] Estado de pago:', JSON.stringify(payment))

    // status 2 = pagado, otros = pendiente/rechazado/anulado
    if (payment.status !== 2) {
      console.log('[flow/webhook] Pago no aprobado, status:', payment.status)
      return NextResponse.json({ ok: true })
    }

    // 3. Buscar la reserva por flow_order_id (commerceOrder)
    const commerceOrder = payment.commerceOrder as string
    if (!commerceOrder) {
      return NextResponse.json({ error: 'commerceOrder faltante' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('flow_order_id', commerceOrder)
      .single()

    if (findError || !booking) {
      console.error('[flow/webhook] Reserva no encontrada para order:', commerceOrder)
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    // 4. Actualizar reserva a confirmed + guardar datos del pago
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        flow_payment_id: payment.flowOrder?.toString() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    if (updateError) {
      console.error('[flow/webhook] Error actualizando reserva:', updateError)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    console.log('[flow/webhook] Reserva confirmada:', booking.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[flow/webhook] Error inesperado:', err)
    // Devolver 500 para que Flow reintente
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
