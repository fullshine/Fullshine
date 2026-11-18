export const CAMPAIGNS = { unknown: 'Por identificar', pulido_tapiz: 'Pulido + tapiz', ceramico: 'Tratamiento cerámico' } as const
export const STAGES = { nuevo: 'Nuevo', cotizado: 'Cotizado', seguimiento: 'Seguimiento', reserva_pendiente: 'Reserva pendiente', agendado: 'Agendado', cerrado: 'Cerrado sin reserva', realizado: 'Realizado' } as const
export type Campaign = keyof typeof CAMPAIGNS
export type Stage = keyof typeof STAGES
export interface Lead {
  id: string; phone: string; customer_name: string | null; campaign: Campaign; stage: Stage;
  vehicle: string; notes: string; paused: boolean; opted_out: boolean;
  last_inbound_at: string | null; updated_at: string; quoted_price: number | null;
}
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function classify(text: string): Campaign {
  const t = normalize(text)
  const ceramic = /\b(ceramico|ceramica|coating)\b/.test(t)
  const combo = /\bpulido\b/.test(t) && /\b(tapiz|tapices|interior)\b/.test(t)
  return ceramic === combo ? 'unknown' : ceramic ? 'ceramico' : 'pulido_tapiz'
}
export function isOptOut(text: string) {
  return /\b(no me interesa|no estoy interesado|no estoy interesada|no me escriban|no me escribas|no me contacten|dejen de escribir|darme de baja)\b/.test(normalize(text)) || /^(stop|baja|cancelar mensajes)[.! ]*$/.test(normalize(text).trim())
}
export function wantsHuman(text: string) {
  return /\b(hablar con (juan|una persona|alguien|un humano)|reclamo|asesor|persona real)\b/.test(normalize(text))
}
export function welcome(campaign: Campaign) {
  const intro = '¡Hola! Soy el asistente de Fullshine 👋 '
  if (campaign === 'pulido_tapiz') return intro + 'El paquete combina pulido abrillantador y limpieza de tapiz Platino. ¿Qué marca, modelo y año es tu vehículo? Así Juan puede confirmar el valor y alcance para tu auto.'
  if (campaign === 'ceramico') return intro + 'Te ayudamos a proteger y realzar el brillo de tu vehículo con tratamiento cerámico. ¿Qué marca, modelo y año es? ¿Es nuevo o ya tiene tiempo de uso?'
  return intro + '¿Te interesa pulido + limpieza de tapiz o tratamiento cerámico? Cuéntanos también la marca, modelo y año de tu vehículo.'
}
export function isBusinessHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(date)
  const day = parts.find(p => p.type === 'weekday')?.value
  const hour = Number(parts.find(p => p.type === 'hour')?.value)
  return day !== 'Sun' && hour >= 9 && hour < (day === 'Sat' ? 14 : 19)
}
