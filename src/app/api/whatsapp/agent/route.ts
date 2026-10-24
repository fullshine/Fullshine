// =============================================
// FULLSHINE - Webhook GreenAPI → Asistente guiado
// Configurar en GreenAPI:
//   webhookUrl = https://www.fullshine.autos/api/whatsapp/agent?token=<AGENT_WEBHOOK_SECRET>
//   eventos: incomingMessageReceived + outgoingMessageReceived (teléfono/web)
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { processIncomingMessage, handleAdminCommand } from '@/lib/agent'
import { sendRawMessage } from '@/lib/whatsapp'
import { pauseForHuman, canSendAgentMessage } from '@/lib/agent/takeover'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SECRET = process.env.AGENT_WEBHOOK_SECRET
const BRANCH_PHONE = (process.env.NEXT_PUBLIC_BRANCH_PHONE ?? '56933654943').replace(/\D/g, '')
// Número del responsable, separado del número conectado si el proveedor no admite mensajes a sí mismo.
const HANDOFF_PHONE = (process.env.AGENT_HANDOFF_PHONE ?? BRANCH_PHONE).replace(/\D/g, '')
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

  // Entrantes y salientes manuales; ignorar ecos de API y estados.
  if (body.typeWebhook !== 'incomingMessageReceived' && body.typeWebhook !== 'outgoingMessageReceived') {
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
  if (body.typeWebhook === 'outgoingMessageReceived') {
    if (!body.idMessage) return NextResponse.json({ status: 'ignored' })
    try {
      // Messages to the admin/self chat can still control paused conversations.
      if (phone === BRANCH_PHONE || phone === HANDOFF_PHONE) {
        const command = extractText(body.messageData)
        const response = command ? await handleAdminCommand(command) : null
        if (response) await sendRawMessage(phone, response)
        return NextResponse.json({ status: 'admin' })
      }
      await pauseForHuman(phone)
      return NextResponse.json({ status: 'human_takeover' })
    } catch {
      // A failed pause MUST be retried by Green API.
      return NextResponse.json({ status: 'pause_failed' }, { status: 503 })
    }
  }
  const text = extractText(body.messageData)
  if (!text || !body.idMessage) return NextResponse.json({ status: 'ignored' })

  try {
    // Mensajes del propio negocio → canal de comandos de admin
    if (phone === BRANCH_PHONE || phone === HANDOFF_PHONE) {
      const response = await handleAdminCommand(text)
      if (response) await sendRawMessage(phone, response)
      return NextResponse.json({ status: 'admin' })
    }

    const result = await processIncomingMessage(phone, text, body.idMessage, body.senderData?.senderName)

    if (result.reply) {
      // Delay humanizado (2-5s) — nadie responde en 200ms
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000))
      if (!(await canSendAgentMessage(phone, result.handoff))) return NextResponse.json({ status: 'paused' })
      await sendRawMessage(phone, result.reply)
    }

    if (result.handoff && await canSendAgentMessage(phone, true)) {
      await sendRawMessage(
        HANDOFF_PHONE,
        `🤝 *Derivación del bot*\n\nEl cliente +${phone} necesita atención humana.\n` +
        `El bot quedó pausado para este número.\n\n` +
        `Contexto reciente (mensajes, no confirmación de reserva):\n${result.handoffContext ?? text.slice(0, 1000)}\n\n` +
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
