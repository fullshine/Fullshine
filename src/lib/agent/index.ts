// =============================================
// FULLSHINE - WhatsApp guiado sin IA
// Reglas deterministas y estado persistente; sin llamadas a proveedores de IA.
// =============================================

import { createAdminClient } from '@/lib/supabase/server'
import { salesReply } from './catalog-router'
import type { SalesState } from './catalog-flow'

const DAILY_REPLY_CAP = 40      // respuestas máx. por contacto en 24h (anti-abuso)

export interface AgentResult {
  reply: string | null          // null = no responder (pausado, cap, deshabilitado)
  handoffContext?: string       // últimos mensajes reales, no resumen inventado
  handoff: boolean              // true = derivar a humano (pausar + avisar admin)
}

interface Conversation {
  id: string
  phone: string
  status: 'active' | 'paused'
  flow_state?: SalesState | null
}

async function getOrCreateConversation(phone: string, name?: string): Promise<Conversation> {
  const supabase = createAdminClient()
  const { data: existing, error: readError } = await supabase
    .from('agent_conversations')
    .select('id, phone, status, flow_state')
    .eq('phone', phone)
    .maybeSingle()

  if (readError) throw new Error('No se pudo leer el estado del asistente; verifica las migraciones')
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
    .select('id, phone, status, flow_state')
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

async function pauseConversation(conversationId: string): Promise<void> {
  const { error } = await createAdminClient().from('agent_conversations')
    .update({ status: 'paused' }).eq('id', conversationId)
  if (error) throw new Error('No se pudo pausar la conversación')
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

  const conv = await getOrCreateConversation(phone, senderName)

  // Guardar entrante SIEMPRE (aunque esté pausada, para que el humano tenga contexto)
  const isNew = await saveMessage(conv.id, 'user', text, greenMsgId)
  if (!isNew) return { reply: null, handoff: false } // reintento de GreenAPI

  // Conversación derivada a humano → el agente no interviene
  if (conv.status === 'paused') return { reply: null, handoff: false }

  // Tope diario por contacto
  const replies = await countRepliesLast24h(conv.id)
  if (replies >= DAILY_REPLY_CAP) {
    await pauseConversation(conv.id)
    return { reply: null, handoff: true, handoffContext: 'Límite de respuestas alcanzado. Último mensaje del cliente: ' + text.slice(0, 1000) }
  }

  const result = await salesReply(conv.flow_state, text)
  const { error } = await createAdminClient().from('agent_conversations')
    .update({ flow_state: result.state, ...(result.handoff ? { status: 'paused' } : {}) }).eq('id', conv.id)
  if (error) throw new Error('No se pudo guardar o pausar el flujo guiado')
  await saveMessage(conv.id, 'assistant', result.reply)
  return { reply: result.reply, handoff: result.handoff,
    ...(result.handoff ? { handoffContext: result.handoffContext } : {}) }

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
      .update({ status, ...(status === 'active' ? { flow_state: null } : {}) })
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
