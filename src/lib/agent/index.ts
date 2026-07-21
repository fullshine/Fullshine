// =============================================
// FULLSHINE - Agente IA WhatsApp: lógica central
// Historial → Claude → respuesta, con guardrails.
// =============================================

import { createAdminClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from './prompt'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.AGENT_MODEL ?? 'claude-haiku-4-5-20251001'
const MAX_HISTORY = 20          // mensajes de contexto por conversación
const DAILY_REPLY_CAP = 40      // respuestas máx. por contacto en 24h (anti-abuso)

export interface AgentResult {
  reply: string | null          // null = no responder (pausado, cap, deshabilitado)
  handoff: boolean              // true = derivar a humano (pausar + avisar admin)
}

interface Conversation {
  id: string
  phone: string
  status: 'active' | 'paused'
}

async function getOrCreateConversation(phone: string, name?: string): Promise<Conversation> {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from('agent_conversations')
    .select('id, phone, status')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('agent_conversations')
      .update({ last_message_at: new Date().toISOString(), ...(name ? { customer_name: name } : {}) })
      .eq('id', existing.id)
    return existing as Conversation
  }

  const { data: created, error } = await supabase
    .from('agent_conversations')
    .insert({ phone, customer_name: name ?? null })
    .select('id, phone, status')
    .single()
  if (error || !created) throw new Error(`No se pudo crear conversación: ${error?.message}`)
  return created as Conversation
}

/** Guarda un mensaje. Devuelve false si green_msg_id ya existía (duplicado). */
async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  greenMsgId?: string
): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('agent_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    green_msg_id: greenMsgId ?? null,
  })
  if (error) {
    if (error.code === '23505') return false // unique violation → mensaje duplicado
    throw new Error(`No se pudo guardar mensaje: ${error.message}`)
  }
  return true
}

async function loadHistory(conversationId: string): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('agent_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY)
  return (data ?? []).reverse() as { role: 'user' | 'assistant'; content: string }[]
}

async function countRepliesLast24h(conversationId: string): Promise<number> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('agent_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('role', 'assistant')
    .gte('created_at', since)
  return count ?? 0
}

async function callClaude(
  system: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: history,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${err.slice(0, 300)}`)
  }
  const data = await res.json()
  const text = data?.content?.find((b: { type: string }) => b.type === 'text')?.text
  if (!text) throw new Error('Respuesta vacía de Claude')
  return text.trim()
}

/**
 * Procesa un mensaje entrante y devuelve la respuesta del agente (o null).
 * NO envía el mensaje — eso lo hace el webhook (separación para testear).
 */
export async function processIncomingMessage(
  phone: string,
  text: string,
  greenMsgId: string,
  senderName?: string
): Promise<AgentResult> {
  if (process.env.AGENT_ENABLED !== 'true') return { reply: null, handoff: false }
  if (!ANTHROPIC_API_KEY) return { reply: null, handoff: false }

  const conv = await getOrCreateConversation(phone, senderName)

  // Guardar entrante SIEMPRE (aunque esté pausada, para que el humano tenga contexto)
  const isNew = await saveMessage(conv.id, 'user', text, greenMsgId)
  if (!isNew) return { reply: null, handoff: false } // reintento de GreenAPI

  // Conversación derivada a humano → el agente no interviene
  if (conv.status === 'paused') return { reply: null, handoff: false }

  // Tope diario por contacto
  const replies = await countRepliesLast24h(conv.id)
  if (replies >= DAILY_REPLY_CAP) return { reply: null, handoff: true }

  const [system, history] = await Promise.all([buildSystemPrompt(), loadHistory(conv.id)])
  let reply = await callClaude(system, history)

  // Handoff solicitado por el modelo
  let handoff = false
  if (reply.startsWith('[DERIVAR]')) {
    handoff = true
    reply = reply.replace('[DERIVAR]', '').trim()
    if (!reply) reply = 'Un especialista de Fullshine te responderá en breve. ¡Gracias por tu paciencia! 🙌'
  }

  await saveMessage(conv.id, 'assistant', reply)

  if (handoff) {
    const supabase = createAdminClient()
    await supabase.from('agent_conversations').update({ status: 'paused' }).eq('id', conv.id)
  }

  return { reply, handoff }
}

/** Comandos del administrador (desde el teléfono del negocio) */
export async function handleAdminCommand(text: string): Promise<string | null> {
  const supabase = createAdminClient()
  const t = text.trim().toLowerCase()

  const match = t.match(/^(pausar|activar)\s+(\+?[\d\s-]{8,15})$/)
  if (match) {
    const action = match[1]
    let phone = match[2].replace(/\D/g, '')
    if (!phone.startsWith('56')) phone = `56${phone}`
    const status = action === 'pausar' ? 'paused' : 'active'
    const { data } = await supabase
      .from('agent_conversations')
      .update({ status })
      .eq('phone', phone)
      .select('id')
      .maybeSingle()
    if (!data) return `No encontré conversación con ${phone}`
    return action === 'pausar'
      ? `✅ Bot pausado para ${phone}. Responde tú directamente. Escribe "activar ${phone}" para reactivarlo.`
      : `✅ Bot reactivado para ${phone}.`
  }

  if (t === 'bot estado' || t === 'bot status') {
    const { data } = await supabase
      .from('agent_conversations')
      .select('phone, status, last_message_at')
      .order('last_message_at', { ascending: false })
      .limit(10)
    if (!data || data.length === 0) return 'Sin conversaciones aún.'
    const lines = data.map(c => `${c.status === 'paused' ? '⏸' : '🟢'} ${c.phone}`)
    return `*Últimas conversaciones:*\n${lines.join('\n')}\n\nComandos: "pausar <fono>", "activar <fono>"`
  }

  return null // no es un comando → ignorar (no queremos que el bot le responda al admin)
}
