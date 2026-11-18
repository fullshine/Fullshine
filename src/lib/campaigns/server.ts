import { createAdminClient } from '@/lib/supabase/server'
import { classify, isOptOut, wantsHuman, welcome, isBusinessHour } from './rules'

export interface CampaignWebhook {
  typeWebhook?: string; idMessage?: string; timestamp?: number;
  instanceData?: { idInstance?: number };
  senderData?: { chatId?: string; senderName?: string };
  messageData?: { typeMessage?: string; textMessageData?: { textMessage?: string }; extendedTextMessageData?: { text?: string } };
}
export async function ingestCampaignEvent(body: CampaignWebhook) {
  if (!['incomingMessageReceived', 'outgoingMessageReceived'].includes(body.typeWebhook ?? '')) return
  const phone = body.senderData?.chatId?.match(/^(56\d{9})@c\.us$/)?.[1]
  const ownPhone = (process.env.NEXT_PUBLIC_BRANCH_PHONE ?? '56933654943').replace(/\D/g, '')
  if (!phone || phone === ownPhone || !body.idMessage || !Number.isFinite(body.timestamp)) return
  const at = Number(body.timestamp) * 1000
  if (at > Date.now() + 60_000 || at < Date.now() - 24 * 3600_000) return
  const human = body.typeWebhook === 'outgoingMessageReceived'
  const md = body.messageData
  const text = (md?.textMessageData?.textMessage ?? md?.extendedTextMessageData?.text ?? `[Adjunto: ${md?.typeMessage ?? 'desconocido'}]`).slice(0, 6000)
  const campaign = classify(text)
  const { error } = await createAdminClient().rpc('wa_ingest', {
    p_phone: phone, p_name: human ? null : body.senderData?.senderName?.slice(0, 120) ?? null,
    p_id: `${body.typeWebhook}:${body.idMessage}`, p_text: text, p_at: new Date(at).toISOString(),
    p_human: human, p_campaign: campaign, p_stop: !human && isOptOut(text),
    p_handoff: !human && (wantsHuman(text) || text.startsWith('[Adjunto:')),
    p_welcome: welcome(campaign),
  })
  if (error) throw new Error('No se pudo registrar el mensaje de campaña')
}

/** Cola persistente: nunca repetir automáticamente un envío cuyo resultado es incierto. */
export async function dispatchCampaignMessages(onlyId?: string, limit = 5) {
  if (process.env.CAMPAIGNS_ENABLED !== 'true' || process.env.CAMPAIGNS_SEND_ENABLED !== 'true') return { sent: 0, disabled: true }
  const db = createAdminClient()
  // Una ejecución interrumpida puede haber enviado: requiere revisión humana.
  const recovered = await db.from('wa_outbox').update({ status: 'uncertain', error: 'Envío interrumpido: verificar en WhatsApp antes de volver a contactar.' })
    .eq('status', 'sending').lt('claimed_at', new Date(Date.now() - 10 * 60_000).toISOString())
  if (recovered.error) throw new Error('No se pudo revisar la cola')
  let query = db.from('wa_outbox').select('id,kind,due_at').eq('status', 'queued').lte('due_at', new Date().toISOString()).order('due_at').limit(onlyId ? 1 : limit)
  if (onlyId) query = query.eq('id', onlyId)
  const { data: jobs, error } = await query
  if (error) throw new Error('No se pudo leer la cola')
  let sent = 0
  for (const candidate of jobs ?? []) {
    if (candidate.kind === 'welcome' && Date.now() - Date.parse(candidate.due_at) > 15 * 60_000) {
      await db.from('wa_outbox').update({ status: 'cancelled' }).eq('id', candidate.id).eq('status', 'queued')
      continue
    }
    if (candidate.kind.startsWith('followup') && !isBusinessHour()) continue
    // No enviar los dos recordatorios juntos después de una caída prolongada.
    if (candidate.kind === 'followup1' && Date.now() - Date.parse(candidate.due_at) > 48 * 3600_000) {
      await db.from('wa_outbox').update({ status: 'cancelled' }).eq('id', candidate.id).eq('status', 'queued')
      continue
    }
    const claimed = await db.rpc('wa_claim', { p_id: candidate.id })
    if (claimed.error) throw new Error('No se pudo reservar el envío')
    const job = claimed.data?.[0]
    if (!job) continue
    try {
      const { data: lead, error: leadError } = await db.from('wa_leads').select('phone,paused,opted_out,stage').eq('id', job.lead_id).single()
      if (leadError) throw new Error('Contacto no disponible')
      if (lead.opted_out || (lead.paused && job.kind !== 'quote') || ['reserva_pendiente','agendado','cerrado','realizado'].includes(lead.stage)) {
        await db.from('wa_outbox').update({ status: 'cancelled' }).eq('id', job.id)
        continue
      }
      const base = process.env.GREEN_API_URL ?? 'https://7107.api.greenapi.com'
      const instance = process.env.GREEN_API_INSTANCE_ID
      const token = process.env.GREEN_API_TOKEN
      if (!instance || !token) throw new Error('Conexión GREEN-API sin configurar')
      const response = await fetch(`${base}/waInstance${instance}/sendMessage/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: `${lead.phone}@c.us`, message: job.body }), signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error('Proveedor no confirmó el envío')
      const result = await response.json()
      if (typeof result.idMessage !== 'string' || !result.idMessage) throw new Error('Proveedor no devolvió identificador')
      const finished = await db.rpc('wa_finish', { p_id: job.id, p_provider: result.idMessage })
      if (finished.error) throw new Error('No se pudo registrar la confirmación')
      sent++
    } catch {
      // No incluir URL, token, teléfono ni mensajes de proveedor en los logs.
      const saved = await db.from('wa_outbox').update({ status: 'uncertain', error: 'Verificar en WhatsApp si llegó. No se reintentará automáticamente.' }).eq('id', job.id).eq('status', 'sending')
      if (saved.error) throw new Error('Revisar envío pendiente en la cola')
    }
  }
  return { sent, disabled: false }
}
