// =============================================
// FULLSHINE - Webhook GreenAPI → Agente IA
// Configurar en GreenAPI:
//   webhookUrl = https://www.fullshine.autos/api/whatsapp/agent?token=<AGENT_WEBHOOK_SECRET>
//   solo evento: incomingMessageReceived
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { processIncomingMessage, handleAdminCommand } from '@/lib/agent'
import { sendRawMessage } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SECRET = process.env.AGENT_WEBHOOK_SECRET
const BRANCH_PHONE = (process.env.NEXT_PUBLIC_BRANCH_PHONE ?? '56933654943').replace(/\D/g, '')
const MAX_AGE_MS = 5 * 60 * 1000 // ignorar mensajes con más de 5 min (backlog de reintentos)

interface GreenWebhook {
  typeWebhook?: string
  idMessage?: string
  timestamp?: number
  senderData?: { chatId?: string; senderName?: string }
  messageData?: {
    typeMessage?: string
    textMessageData?: { textMessage?: string }
    extendedTextMessageData?: { text?: string }
  }
}

function extractText(md: GreenWebhook['messageData']): string | null {
  if (!md) return null
  if (md.typeMessage === 'textMessage') return md.textMessageData?.textMessage ?? null
  if (md.typeMessage === 'extendedTextMessage') return md.extendedTextMessageData?.text ?? null
  // Medios: el agente responde con contexto de que llegó un adjunto
  if (md.typeMessage === 'imageMessage') return '[el cliente envió una imagen]'
  if (md.typeMessage === 'audioMessage') return '[el cliente envió un audio]'
  if (md.typeMessage === 'videoMessage') return '[el cliente envió un video]'
  if (md.typeMessage === 'documentMessage') return '[el cliente envió un documento]'
  return null
}

export async function POST(request: NextRequest) {
  // Autenticación por secret en la URL
  const token = new URL(request.url).searchParams.get('token')
  if (!SECRET || token !== SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: GreenWebhook
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Solo mensajes entrantes (nunca ecos de salida ni estados)
  if (body.typeWebhook !== 'incomingMessageReceived') {
    return NextResponse.json({ status: 'ignored' })
  }

  const chatId = body.senderData?.chatId ?? ''
  // Solo chats privados (nunca grupos @g.us ni estados)
  if (!chatId.endsWith('@c.us')) return NextResponse.json({ status: 'ignored' })

  // Mensajes viejos (reenvíos tras caída) → no responder
  if (body.timestamp && Date.now() - body.timestamp * 1000 > MAX_AGE_MS) {
    return NextResponse.json({ status: 'stale' })
  }

  const phone = chatId.replace('@c.us', '')
  const text = extractText(body.messageData)
  if (!text || !body.idMessage) return NextResponse.json({ status: 'ignored' })

  try {
    // Mensajes del propio negocio → canal de comandos de admin
    if (phone === BRANCH_PHONE) {
      const response = await handleAdminCommand(text)
      if (response) await sendRawMessage(phone, response)
      return NextResponse.json({ status: 'admin' })
    }

    const result = await processIncomingMessage(phone, text, body.idMessage, body.senderData?.senderName)

    if (result.reply) {
      // Delay humanizado (2-5s) — nadie responde en 200ms
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000))
      await sendRawMessage(phone, result.reply)
    }

    if (result.handoff) {
      await sendRawMessage(
        BRANCH_PHONE,
        `🤝 *Derivación del bot*\n\nEl cliente +${phone} necesita atención humana.\n` +
        `El bot quedó pausado para este número.\n\n` +
        `Escríbele directo por WhatsApp. Cuando termines: "activar ${phone}"`
      )
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Agent webhook error:', err)
    // 200 igual: si devolvemos 5xx GreenAPI reintenta y duplicaríamos procesamiento
    return NextResponse.json({ status: 'error' })
  }
}
