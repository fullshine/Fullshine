'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { dispatchCampaignMessages } from '@/lib/campaigns/server'

async function staff() {
  const client = createClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Inicia sesión para gestionar campañas')
  const { data: user, error: roleError } = await client.from('users').select('role').eq('id', data.user.id).single()
  if (roleError || !['admin', 'staff'].includes(user?.role)) throw new Error('No autorizado')
  return createAdminClient()
}
export async function getCampaignLeads() {
  try {
    const db = await staff()
    const { data, error } = await db.from('wa_leads').select('*').order('updated_at', { ascending: false }).limit(200)
    if (error) throw new Error('No se pudo cargar campañas. Comprueba que la migración 32 esté aplicada.')
    return { data: data ?? [], error: null }
  } catch (e) { return { data: [], error: (e as Error).message } }
}
export async function getCampaignHistory(id: string) {
  const db = await staff()
  z.string().uuid().parse(id)
  const [events, outbox] = await Promise.all([
    db.from('wa_events').select('*').eq('lead_id', id).order('occurred_at', { ascending: false }).limit(30),
    db.from('wa_outbox').select('*').eq('lead_id', id).order('created_at', { ascending: false }).limit(30),
  ])
  if (events.error || outbox.error) throw new Error('No se pudo cargar el historial')
  return { events: events.data ?? [], outbox: outbox.data ?? [] }
}
export async function editCampaignLead(input: unknown) {
  try {
    const db = await staff()
    const p = z.object({ id: z.string().uuid(), campaign: z.enum(['unknown','pulido_tapiz','ceramico']),
      stage: z.enum(['nuevo','cotizado','seguimiento','reserva_pendiente','agendado','cerrado','realizado']),
      vehicle: z.string().max(200), notes: z.string().max(2000), paused: z.boolean() }).parse(input)
    const { error } = await db.rpc('wa_edit', { p_id:p.id, p_campaign:p.campaign, p_stage:p.stage, p_vehicle:p.vehicle, p_notes:p.notes, p_paused:p.paused })
    if (error) throw new Error('No se pudo guardar. Un contacto dado de baja debe permanecer pausado.')
    revalidatePath('/admin/kanban')
    return { success: true, error: null }
  } catch (e) { return { success: false, error: (e as Error).message } }
}
export async function quoteCampaignLead(input: unknown) {
  try {
    const db = await staff()
    if (process.env.CAMPAIGNS_ENABLED !== 'true' || process.env.CAMPAIGNS_SEND_ENABLED !== 'true') throw new Error('Los envíos de campañas están desactivados')
    const p = z.object({ id:z.string().uuid(), price:z.number().int().positive().max(10000000),
      detail:z.string().trim().min(10).max(3000).refine(s => !/\[[^\]]+\]/.test(s), 'Completa los campos entre corchetes'), followups:z.boolean() }).parse(input)
    const message = `${p.detail}\n\nValor total: $${p.price.toLocaleString('es-CL')} CLP.\n¿Qué día te acomodaría traerlo? Revisaremos disponibilidad antes de confirmar.`
    const { data: id, error } = await db.rpc('wa_quote', { p_id:p.id, p_price:p.price, p_body:message, p_followups:p.followups })
    if (error) throw new Error('No se creó el envío. Revisa si ya hay una cotización pendiente, incierta o si el contacto está cerrado.')
    await dispatchCampaignMessages(id)
    const { data: job } = await db.from('wa_outbox').select('status').eq('id',id).single()
    revalidatePath('/admin/kanban')
    return { success: job?.status === 'sent', error: job?.status === 'sent' ? null : 'Cotización registrada; revisa su estado en el historial antes de reenviar.' }
  } catch (e) { return { success: false, error: (e as Error).message } }
}
