import { OCTOBER_CAMPAIGN, isOctoberCampaignActive } from './october-campaign'

type Category = keyof typeof OCTOBER_CAMPAIGN.prices
type Step = 'menu' | 'vehicle' | 'category' | 'accept' | 'schedule' | 'done'
export interface GuidedState {
  version: 1
  step: Step
  vehicle?: string
  category?: Category
  accepted?: boolean
  preference?: string
  misses: number
}
export interface GuidedResult {
  state: GuidedState
  reply: string
  handoff: boolean
  handoffContext?: string
}
const labels: Record<Category, string> = {
  hatch_sedan: 'Sedán/hatchback', suv_camioneta: 'SUV/camioneta', pickup_xl: 'XL',
}
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const price = (category: Category) => '$' + OCTOBER_CAMPAIGN.prices[category].toLocaleString('es-CL')
const xl = (text: string) => /\b(silverado|f[ -]?150|4[ -]?runner)\b/.test(normalize(text))
const categoryQuestion = 'RESPONDE SOLO CON EL NÚMERO de la categoría de tu vehículo:\n1. Sedán/hatchback\n2. SUV/camioneta\n3. XL: Silverado, F-150, 4Runner o cualquier vehículo de tres corridas de asientos.\nResponde 1, 2 o 3. Si no sabes, escribe 0 para consultar con una persona.'
const vehicleQuestion = 'Escribe la marca y modelo de tu vehículo (ejemplo: Toyota RAV4).'
const menu = 'Soy el asistente automático de Fullshine.\n1. Promoción pulido abrillantador + tapiz Platino\n2. Otro servicio o consulta\n0. Hablar con una persona\nResponde con el número.'

function ask(state: GuidedState): string {
  switch (state.step) {
    case 'vehicle': return vehicleQuestion
    case 'category': return categoryQuestion
    case 'accept': return state.category ? `${OCTOBER_CAMPAIGN.name}: *${price(state.category)}* para ${labels[state.category]}.\nSolo en taller: Camilo Henríquez 381, Concepción. Duración estimada: 5–6 horas. Tapiz sin desmontaje; no garantizamos eliminar todas las manchas o rayas.\nReserva hasta el 31 de octubre de 2026; puedes realizar el servicio después. Sujeto a confirmación de disponibilidad.\n¿Aceptas este precio, atención en taller y duración? Escribe ACEPTO para continuar, CAMBIAR para corregir el vehículo o 0 para consultar.` : categoryQuestion
    case 'schedule': return '¿Qué fecha prefieres y a qué hora: 09:00 o 14:00? Puedes responder "por coordinar". A las 14:00, la entrega puede ser entre las 19:00 y las 20:00. Es una solicitud: una persona confirmará disponibilidad y entrega.'
    default: return menu
  }
}

export function guidedReply(previous: GuidedState | null | undefined, text: string, now: Date = new Date()): GuidedResult {
  let state: GuidedState = previous?.version === 1 ? {...previous} : {version: 1, step: 'menu', misses: 0}
  const value = normalize(text)
  const result = (reply: string): GuidedResult => ({state, reply, handoff: false})
  const handoff = (reason: string, reply = 'Te derivaré a una persona de Fullshine para continuar. El asistente queda pausado.'): GuidedResult => {
    state = {...state, step: 'done'}
    return {state, reply, handoff: true, handoffContext: [
      reason, `Campaña: ${OCTOBER_CAMPAIGN.id}`,
      `Vehículo declarado: ${state.vehicle ?? 'pendiente'}`,
      `Categoría: ${state.category ? labels[state.category] : 'pendiente'}`,
      `Precio informado: ${state.category ? price(state.category) : 'pendiente'}`,
      `Precio, taller y duración aceptados: ${state.accepted ? 'sí' : 'no'}`,
      `Preferencia solicitada: ${state.preference ?? 'pendiente'}`,
      'No hay reserva confirmada ni cupo bloqueado por el asistente.',
      `Último mensaje: ${text.slice(0, 500)}`,
    ].join('\n')}
  }
  if (/^(0|humano|persona|asesor|hablar con una persona)$/.test(value) || /\b(hablar con|reclamo|reclamar|devolucion)\b/.test(value)) return handoff('Solicita atención humana.')
  if (/^(stop|baja|parar|no me escribas|no quiero mas mensajes)$/.test(value)) return handoff('Solicita detener respuestas automáticas.', 'Entendido. Las respuestas automáticas quedan detenidas para esta conversación.')
  if (value.startsWith('[el cliente envio')) return handoff('Adjunto pendiente de revisión humana.')
  if (!isOctoberCampaignActive(now)) return handoff('Campaña fuera de vigencia: verificar si existe una reserva anterior.', 'La promoción de octubre no está disponible para nuevas reservas. Si ya reservaste dentro del plazo, una persona revisará tu reserva y sus condiciones.')
  if (state.step === 'done') return handoff('Conversación reactivada: requiere seguimiento humano.')

  if (value === 'cambiar' || value === 'reiniciar') {
    state = {version: 1, step: 'vehicle', misses: 0}
    return result(vehicleQuestion)
  }
  const faq = /\b(donde|direccion|ubicacion)\b/.test(value) ? 'Atendemos esta promoción en Camilo Henríquez 381, Concepción.'
    : /\b(domicilio|a casa)\b/.test(value) ? 'Esta promoción es exclusivamente en taller; no aplica a domicilio.'
    : /\b(incluye|incluido|desmont|manchas|rayas)\b/.test(value) ? 'Incluye pulido abrillantador y limpieza profunda de asientos, techo, suelo, paneles y maletero, con tratamiento de manchas y olores e higienización interior. Sin desmontar asientos. No garantizamos eliminar todas las manchas o rayas.'
    : /\b(demora|duracion|cuanto tarda)\b/.test(value) ? 'El paquete demora aproximadamente 5–6 horas. Se puede entregar más tarde del cierre si es necesario, con coordinación del equipo.'
    : /\b(vigencia|hasta cuando|noviembre)\b/.test(value) && state.step !== 'schedule' ? 'Basta reservar hasta el 31 de octubre de 2026, hora de Chile. El servicio puede realizarse después. Cotizar no equivale a reservar.'
    : /^(precio|precios|cuanto cuesta|valor)\??$/.test(value) ? 'Pulido abrillantador + tapiz Platino: sedán/hatchback $169.990; SUV/camioneta $189.000; XL $209.990.' : null
  if (faq) return result(faq + '\n\n' + ask(state))

  const next = (step: Step) => { state = {...state, step, misses: 0}; return result(ask(state)) }
  const invalid = () => {
    state.misses += 1
    return state.misses >= 2 ? handoff('No se pudo resolver con el flujo guiado.') : result('No pude identificar esa respuesta.\n' + ask(state))
  }
  switch (state.step) {
    case 'menu':
      if (value === '2') return handoff('Consulta por otro servicio.')
      if (value === '1' || /\b(promo|promocion|reel|rav4|octubre)\b/.test(value)) return next('vehicle')
      if (!previous || /^(hola|buenas|buenos dias|buenas tardes)[!. ]*$/.test(value)) return result(menu)
      return invalid()
    case 'vehicle':
      // This field is the customer's declaration, not inferred knowledge about a model.
      if (text.length > 120 || !/^[\p{L}\d][\p{L}\d .-]{2,119}$/u.test(text.trim()) || /^(si|no|hola|acepto|ok|1|2|3)$/.test(value) || text.trim().split(/\s+/).length < 2) return invalid()
      state.vehicle = text.trim()
      if (xl(text)) { state.category = 'pickup_xl'; return next('accept') }
      return next('category')
    case 'category': {
      const categories: Record<string, Category> = {'1': 'hatch_sedan', '2': 'suv_camioneta', '3': 'pickup_xl'}
      const category = categories[value]
      if (!category) return invalid()
      state.category = xl(state.vehicle ?? '') ? 'pickup_xl' : category
      return next('accept')
    }
    case 'accept':
      if (value === 'acepto' && state.category && state.vehicle) { state.accepted = true; return next('schedule') }
      if (/^(no|no acepto|no gracias)$/.test(value)) return handoff('No acepta las condiciones; no está listo para cierre.', 'Entendido. No se ha reservado nada. Una persona puede ayudarte con otra alternativa.')
      return invalid()
    case 'schedule':
      if (!state.accepted || !state.category || !state.vehicle) return handoff('Estado incompleto: revisar antes de cotizar.')
      if (text.length > 160 || !(/\d|lunes|martes|miercoles|jueves|viernes|sabado|domingo|manana|coordinar/i.test(value))) return invalid()
      state.preference = text.trim()
      return handoff('Cliente listo para cierre: verificar capacidad máxima de dos vehículos diarios y registrar precio promocional.', '¡Gracias! Ya tengo tu solicitud. Una persona de Fullshine confirmará disponibilidad y finalizará la reserva contigo. Aún no hay una hora reservada.')
  }
  return handoff('Estado desconocido: revisión humana necesaria.')
}
