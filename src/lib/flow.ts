// Flow.cl payment integration
// Env vars needed: FLOW_API_KEY, FLOW_SECRET_KEY
// Docs: https://www.flow.cl/app/web/api.php

import crypto from 'crypto'

const FLOW_API_URL = 'https://www.flow.cl/api'
const API_KEY = process.env.FLOW_API_KEY!
const SECRET_KEY = process.env.FLOW_SECRET_KEY!

function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', SECRET_KEY).update(sorted).digest('hex')
}

export async function createPaymentLink(params: {
  orderId: string
  amount: number
  subject: string
  customerEmail?: string
  urlReturn: string
  urlConfirmation: string
}): Promise<{ url: string; token: string; flowOrder: string }> {
  const p: Record<string, string> = {
    apiKey: API_KEY,
    commerceOrder: params.orderId,
    subject: params.subject,
    currency: 'CLP',
    amount: Math.round(params.amount).toString(),
    email: params.customerEmail ?? '',
    paymentMethod: '9',
    urlConfirmation: params.urlConfirmation,
    urlReturn: params.urlReturn,
  }

  p.s = sign(p)

  const body = new URLSearchParams(p)
  const res = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Flow API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  if (data.code && data.code !== 200) {
    throw new Error(`Flow error ${data.code}: ${data.message}`)
  }

  return {
    url: `${data.url}?token=${data.token}`,
    token: data.token,
    flowOrder: data.flowOrder?.toString() ?? '',
  }
}
