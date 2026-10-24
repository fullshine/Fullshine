import { createAdminClient } from '@/lib/supabase/server'

/** A phone/web message is human ownership, even before a client has used the bot. */
export async function pauseForHuman(phone: string): Promise<void> {
  const {error} = await createAdminClient().from('agent_conversations').upsert({
    phone, status: 'paused', flow_state: {manualTakeover: true},
    last_message_at: new Date().toISOString(),
  }, {onConflict: 'phone'})
  if (error) throw new Error('No se pudo registrar la atención humana')
}

/** Re-read shared storage after the delay, not the request's earlier snapshot. */
export async function canSendAgentMessage(phone: string, automaticHandoff = false): Promise<boolean> {
  if (process.env.AGENT_ENABLED !== 'true') return false
  const {data, error} = await createAdminClient().from('agent_conversations')
    .select('status,flow_state').eq('phone', phone).maybeSingle()
  if (error || !data || data.flow_state?.manualTakeover) return false
  return data.status === 'active' || (automaticHandoff && data.status === 'paused')
}
