import type { GuidedState } from './guided-flow'
import { OCTOBER_CAMPAIGN, isOctoberCampaignActive } from './october-campaign'
import { SERVICE_CATEGORY_LABELS, compareServicePlans } from '@/lib/catalogo-servicios'
import { promoDiscountFor, promoPrice } from '@/lib/promo'
import { isMetalCoat } from '@/lib/ceramicos'

export interface CatalogService {
  id: string; name: string; category: string; description?: string | null
  duration_hours?: number | null; is_active?: boolean
  prices: { vehicle_type: string; price_clp: number }[]
}
type Vehicle = 'hatch_sedan' | 'suv_camioneta' | 'pickup_xl'
// Retained to read conversations already in progress without a database migration.
export interface CatalogState {
  version: 2
  step: 'initial_vehicle' | 'initial_category' | 'home' | 'categories' | 'years' | 'plans' | 'detail' | 'vehicle' | 'category' | 'accept' | 'schedule' | 'done'
  misses: number; category?: string; years?: number; options?: string[]; serviceId?: string
  vehicle?: string; vehicleType?: Vehicle; quote?: string; accepted?: boolean; preference?: string
}
export interface QuickState {
  version: 3
  step: 'home' | 'categories' | 'years' | 'plans' | 'detail' | 'vehicle' | 'category' | 'schedule' | 'done'
  misses: number; category?: string; years?: number; options?: string[]; serviceId?: string
  campaign?: boolean; vehicle?: string; vehicleType?: Vehicle; quote?: string
  bookingRequested?: boolean; preference?: string
}
export type SalesState = GuidedState | CatalogState | QuickState
export interface SalesResult { state: SalesState; reply: string; handoff: boolean; handoffContext?: string }
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const money = (n: number) => '$' + n.toLocaleString('es-CL')
const labels = { hatch_sedan: 'Sedán/hatchback', suv_camioneta: 'SUV/camioneta', pickup_xl: 'XL / tres corridas' }
// An explicit public allowlist also excludes newly added private partner categories.
const order = ['lavado_detallado', 'tapiz', 'pulido', 'ceramico', 'mantencion', 'adicional', 'precompra', 'revision']
const nav = '\n\n0: hablar con una persona · MENÚ: otros servicios'
const vehicleQuestion = '¿Qué marca y modelo tienes? Ejemplo: Toyota RAV4. Si sabes, agrega si es sedán, SUV o de tres corridas.'
const categoryQuestion = '¿De qué tamaño es tu vehículo?\n1. Sedán/hatchback\n2. SUV/camioneta\n3. XL o tres corridas (incluye Silverado, F-150 y 4Runner)'
const scheduleQuestion = '¿Qué fecha y hora prefieres? También puedes decir «por coordinar». El equipo confirmará precio, condiciones y disponibilidad; aún no hay una reserva confirmada.'
const xl = (text: string) => /\b(silverado|f[ -]?150|4[ -]?runner|3 corridas|tres corridas)\b/.test(norm(text))
function explicitType(text: string): Vehicle | undefined {
  const value = norm(text)
  if (xl(text) || /\bxl\b/.test(value)) return 'pickup_xl'
  if (/\b(suv|camioneta)\b/.test(value)) return 'suv_camioneta'
  if (/\b(sedan|hatchback)\b/.test(value)) return 'hatch_sedan'
}
function migrate(previous?: SalesState | null): QuickState {
  if (!previous) return { version: 3, step: 'home', misses: 0 }
  if (previous.version === 3) return { ...previous }
  if (previous.version === 1) return {
    version: 3, step: previous.step === 'menu' ? 'detail' : previous.step === 'accept' ? 'detail' : previous.step,
    misses: 0, campaign: true, vehicle: previous.vehicle, vehicleType: previous.category,
    bookingRequested: previous.step === 'schedule', preference: previous.preference,
  }
  const step = previous.step === 'initial_vehicle' ? 'home'
    : previous.step === 'initial_category' ? 'category'
    : previous.step === 'accept' ? 'detail' : previous.step
  return { version: 3, step, misses: 0, category: previous.category, years: previous.years,
    options: previous.options, serviceId: previous.serviceId, vehicle: previous.vehicle,
    vehicleType: previous.vehicleType, bookingRequested: ['vehicle', 'category', 'schedule'].includes(previous.step),
    preference: previous.preference }
}

export function catalogReply(previous: SalesState | null | undefined, text: string, catalog: CatalogService[], now = new Date()): SalesResult {
  const value = norm(text)
  let state = migrate(previous)
  const services = catalog.filter(s => s.is_active !== false && order.includes(s.category))
  const categories = order.filter(c => services.some(s => s.category === c))
  const selected = () => services.find(s => s.id === state.serviceId)
  const fresh = (): QuickState => ({ version: 3, step: 'home', misses: 0, vehicle: state.vehicle, vehicleType: state.vehicleType })
  const cost = (s: CatalogService, type: Vehicle) => {
    const p = s.prices?.find(p => p.vehicle_type === type)?.price_clp
    if (typeof p !== 'number' || !Number.isFinite(p) || p < 0) return null
    const discount = promoDiscountFor(s.category)
    return discount > 0 ? promoPrice(p, discount) : p
  }
  const priceLines = (s?: CatalogService) => (state.vehicleType ? [state.vehicleType] : Object.keys(labels) as Vehicle[])
    .map(t => { const p = state.campaign ? OCTOBER_CAMPAIGN.prices[t] : s ? cost(s, t) : null
      return `${labels[t]}: ${p === null ? 'consultar' : money(p)}` }).join(' · ')
  const duration = (s: CatalogService) => s.duration_hours && s.duration_hours > 0
    ? `${s.duration_hours < 1 ? Math.round(s.duration_hours * 60) + ' minutos' : s.duration_hours + ' horas'} aprox.` : 'por confirmar'
  const details = () => state.campaign
    ? `*${OCTOBER_CAMPAIGN.name}*\n${priceLines()}\nEn taller: Camilo Henríquez 381, Concepción. Duración: 5–6 horas. Tapiz sin desmontaje; resultados sujetos al estado del vehículo.\nReserva hasta el 31 de octubre de 2026; el servicio puede realizarse después.`
    : selected() ? `*${selected()!.name}*\n${priceLines(selected())}\n${selected()!.description || 'El equipo puede explicarte los detalles.'}\nDuración: ${duration(selected()!)}\nTaller: Camilo Henríquez 381, Concepción. Resultados sujetos al estado del vehículo.` : ''
  const prompt = (): string => {
    switch (state.step) {
      case 'home': return '¡Hola! Soy el asistente automático de Fullshine. ¿Qué servicio te interesa? Escribe LAVADO, TAPIZ, PULIDO o CERÁMICO.' + (isOctoberCampaignActive(now) ? '\n1. Promoción pulido + tapiz Platino' : '') + '\n2. Ver todos los servicios'
      case 'categories': return '¿Qué servicio te interesa?\n' + (state.options ?? []).map((c,i) => `${i+1}. ${SERVICE_CATEGORY_LABELS[c]}`).join('\n')
      case 'years': return '¿Qué protección cerámica buscas?\n1. Un año\n2. Tres años'
      case 'plans': return `*${SERVICE_CATEGORY_LABELS[state.category!]}*\n` + (state.options ?? []).map((id,i) => {
        const s = services.find(s => s.id === id)
        return s ? `${i+1}. *${s.name}*\n${priceLines(s)}` : `${i+1}. Opción no disponible`
      }).join('\n\n') + '\n\nElige el número o nombre de un plan para ver qué incluye. Puedes escribir «agendar 1» para solicitar ese plan.'
      case 'detail': return details() + '\n\n¿Quieres solicitar una hora? Escribe AGENDAR o pregunta qué incluye.'
      case 'vehicle': return vehicleQuestion
      case 'category': return categoryQuestion
      case 'schedule': return (state.quote ? state.quote + '\n\n' : '') + scheduleQuestion
      default: return 'Una persona continuará contigo.'
    }
  }
  const reply = (message = prompt()): SalesResult => ({ state, reply: message + nav, handoff: false })
  const handoff = (reason: string, message = 'Te derivaré a una persona de Fullshine. El asistente queda pausado para esta conversación.'): SalesResult => {
    state = { ...state, step: 'done' }
    return { state, reply: message, handoff: true, handoffContext: [reason,
      `Servicio: ${state.campaign ? OCTOBER_CAMPAIGN.name : selected()?.name ?? 'por definir'}`,
      `Vehículo: ${state.vehicle ?? 'pendiente'}`, `Categoría: ${state.vehicleType ? labels[state.vehicleType] : 'pendiente'}`,
      `Cotización informada: ${state.quote ?? 'pendiente; confirmar con el cliente'}`,
      `Solicita agendar: ${state.bookingRequested ? 'sí' : 'no'}`, 'Precio, condiciones y disponibilidad: confirmar con el cliente.',
      `Preferencia: ${state.preference ?? 'por coordinar'}`, 'No hay reserva confirmada ni cupo bloqueado.', `Último mensaje: ${text.slice(0,500)}`].join('\n') }
  }
  const next = (step: QuickState['step']) => { state = { ...state, step, misses: 0 }; return reply() }
  const showCategories = () => { state = { ...fresh(), step: 'categories', options: categories }; return categories.length ? reply() : handoff('Catálogo público no disponible.') }
  const showPlans = () => {
    const plans = services.filter(s => s.category === state.category && (!state.years || isMetalCoat(s) === (state.years === 1))).sort(compareServicePlans)
    state = { ...fresh(), category: state.category, years: state.years, step: 'plans', options: plans.map(s => s.id) }
    return plans.length ? reply() : handoff('No hay planes disponibles en esta selección.')
  }
  const invalid = () => { state.misses++; return state.misses >= 2 ? handoff('Consulta que requiere atención humana.') : reply('No logré identificarlo. Puedes escribir el servicio o pedir una persona.\n' + prompt()) }
  const requestSchedule = () => {
    if (!state.campaign && (!selected() || !state.vehicleType || cost(selected()!, state.vehicleType) === null)) return handoff('Precio no disponible; cotizar manualmente.')
    state.quote = details(); return next('schedule')
  }
  const book = () => {
    state.bookingRequested = true
    if (!state.campaign && !selected()) return handoff('Quiere reservar; falta definir el servicio.')
    if (!state.vehicle) { state.step = 'vehicle'; state.misses = 0; return reply(details() + '\n\n' + vehicleQuestion) }
    if (!state.vehicleType) return next('category')
    return requestSchedule()
  }

  if (/^(0|humano|persona|asesor)$/.test(value) || /\b(hablar con|reclamo|reclamar|devolucion)\b/.test(value)) return handoff('Solicita atención humana.')
  if (/^(stop|baja|parar|no me escribas|no quiero mas mensajes)$/.test(value)) return handoff('Solicita detener respuestas.', 'Entendido. Las respuestas automáticas quedan detenidas para esta conversación.')
  if (value.startsWith('[el cliente envio')) return handoff('Adjunto pendiente de evaluación humana.')
  if (state.step === 'done') return handoff('Conversación derivada: requiere seguimiento humano.')
  if (/^(menu|inicio|servicios|catalogo|reiniciar)$/.test(value) || (previous?.version === 1 && previous.step === 'menu' && value === '2')) {
    state = fresh(); return /^(servicios|catalogo)$/.test(value) || value === '2' ? showCategories() : reply()
  }
  if (value === 'cambiar') {
    state.vehicle = undefined; state.vehicleType = undefined; state.quote = undefined; state.preference = undefined
    return state.serviceId || state.campaign ? next('vehicle') : next('home')
  }
  const bookingIntent = /^(?:(?:si[,!]?\s+)?(?:quiero|quisiera|me gustaria|necesito)\s+)?(?:agendar|reservar|solicitar (?:una )?hora)(?:\s|$)/.test(value) || /^(acepto|si|si por favor|dale|ok)[.!]*$/.test(value) && state.step === 'detail'
  const reject = /^(no|no gracias|no acepto|no quiero (?:agendar|reservar))[.!]*$/.test(value)
  if (reject) { state = fresh(); return reply('Entendido, no se ha reservado nada. Si necesitas otro precio, escribe el servicio.') }
  if (state.serviceId && !selected()) return handoff('El servicio elegido ya no está disponible en el catálogo público.')

  // Match the first message too. A service question must never become a vehicle name.
  const campaignIntent = /\b(promo|promocion|reel)\b/.test(value) || state.step !== 'schedule' && /\boctubre\b/.test(value) || (state.step === 'home' && value === '1')
  const directCategories = [
    ['tapiz', /\b(tapiz|tapices|asientos|limpieza interior)\b/],
    ['ceramico', /\b(ceramico|ceramicos|ceramica|nasiol)\b/],
    ['pulido', /\b(pulido|pulidos|pulir|abrillantado)\b/],
    ['lavado_detallado', /\b(lavado|lavados|lavar)\b/],
    ['mantencion', /\b(mantencion|mantenciones|mantenimiento)\b/],
    ['precompra', /\b(precompra|vender)\b/], ['revision', /\b(revision|diagnostico)\b/], ['adicional', /\b(adicionales)\b/],
  ] as const
  const matches = directCategories.filter(([, re]) => re.test(value))
  // "lavado de tapiz" is one service, not a choice between exterior and interior.
  const direct = matches.find(([c]) => c === 'mantencion') && matches.every(([c]) => ['mantencion','ceramico'].includes(c)) ? 'mantencion'
    : matches.find(([c]) => c === 'tapiz') && matches.every(([c]) => ['tapiz','lavado_detallado'].includes(c))
    ? 'tapiz' : matches.length === 1 ? matches[0][0] : undefined
  const namedServices = services.filter(s => value.includes(norm(s.name)))
  if (!campaignIntent && namedServices.length === 1 && state.serviceId !== namedServices[0].id) {
    const service = namedServices[0]
    state = { ...fresh(), step: 'detail', category: service.category, serviceId: service.id, vehicleType: explicitType(text) ?? state.vehicleType }
    return bookingIntent ? book() : reply()
  }
  if (campaignIntent && !state.campaign) {
    state = { ...fresh(), campaign: true, step: 'detail', vehicleType: explicitType(text) ?? state.vehicleType }
  } else if (direct && (!state.campaign || !['tapiz','pulido'].includes(direct) || /\b(otro|solo|solamente)\b/.test(value)) && state.category !== direct) {
    state = { ...fresh(), category: direct, vehicleType: explicitType(text) ?? state.vehicleType }
    return showPlans()
  } else if (matches.length > 1 && !state.campaign && !selected()) return reply('¿Buscas el paquete de pulido + tapiz? Escribe PROMO. También puedes escribir el servicio que quieras consultar por separado.')

  if (state.campaign && !isOctoberCampaignActive(now)) return handoff('Campaña fuera de vigencia: verificar reservas anteriores.', 'La promoción de octubre no está disponible para nuevas reservas. Si ya reservaste dentro del plazo, una persona revisará tu reserva y sus condiciones.')
  if (campaignIntent) return bookingIntent ? book() : reply()
  if (state.campaign && /\b(vigencia|hasta cuando|noviembre)\b/.test(value) && state.step !== 'schedule') return reply('Basta reservar hasta el 31 de octubre de 2026. El servicio puede realizarse después. Consultar un precio no equivale a reservar.')
  if (/\b(domicilio|a casa)\b/.test(value)) return state.campaign ? reply('Esta promoción es exclusivamente en taller; no aplica a domicilio.') : handoff('Solicita domicilio: confirmar servicio y cobertura.')
  if (/\b(donde|direccion|ubicacion)\b/.test(value)) return reply('Estamos en Camilo Henríquez 381, Concepción.')
  if (/\b(incluye|incluido|precio|precios|valor|valores|cuanto cuesta|cuanto sale|duracion|demora|desmontaje|manchas|rayas)\b/.test(value)) {
    if (state.campaign || selected()) return reply(details() + '\n\nSi quieres solicitar una hora, escribe AGENDAR.')
    if (state.step === 'plans') return reply()
    if (direct) return showPlans()
    return reply('¿De qué servicio quieres saber el valor? Escribe lavado, tapiz, pulido, cerámico o promo.')
  }
  if (value === 'volver') {
    state.bookingRequested = undefined; state.quote = undefined; state.preference = undefined
    if (state.campaign || selected()) return next('detail')
    return showCategories()
  }
  if (bookingIntent && state.step !== 'plans') return book()
  switch (state.step) {
    case 'home':
      if (value === '2') return showCategories()
      if (!previous || /^(hola|buenas|buenos dias|buenas tardes|buenas noches)[!. ]*$/.test(value)) return reply()
      // Preserve a model supplied in response to the old vehicle-first prompt.
      if (previous?.version === 2 && previous.step === 'initial_vehicle' && text.trim().split(/\s+/).length >= 2 && text.length < 120) {
        state.vehicle = text.trim(); state.vehicleType = explicitType(text); return reply()
      }
      return invalid()
    case 'categories': {
      const c = state.options?.[Number(value)-1]
      if (!/^\d+$/.test(value) || !c || !categories.includes(c)) return invalid()
      state.category = c; return showPlans()
    }
    case 'years':
      if (!['1','2'].includes(value)) return invalid()
      state.years = value === '1' ? 1 : 3; return showPlans()
    case 'plans': {
      const index = value.match(/^(?:(?:quiero )?(?:agendar|reservar)\s+)?(\d+)$/)?.[1]
      const planName = value.replace(/^(?:(?:quiero|quisiera) )?(?:agendar|reservar)\s+/, '')
      const byName = (state.options ?? []).filter(id => {
        const s = services.find(s => s.id === id)
        return s && (norm(s.name) === planName || planName.length > 3 && norm(s.name).includes(planName))
      })
      const id = index ? state.options?.[Number(index)-1] : byName.length === 1 ? byName[0] : undefined
      if (!id) return bookingIntent ? handoff('Quiere agendar; falta elegir el plan.') : invalid()
      state.serviceId = id
      return selected() ? bookingIntent ? book() : next('detail') : handoff('La opción elegida dejó de estar disponible.')
    }
    case 'detail':
      if (value === '1') return book() // compatibility with the old detail menu
      if (value === '2' && !state.campaign) return showPlans()
      return invalid()
    case 'vehicle':
      if (text.length > 120 || !/^[\p{L}\d][\p{L}\d .,-]{2,119}$/u.test(text.trim()) || text.trim().split(/\s+/).length < 2) return invalid()
      state.vehicle = text.trim(); state.vehicleType = explicitType(text) ?? state.vehicleType
      if (!state.vehicleType) return next('category')
      return state.bookingRequested ? requestSchedule() : next('detail')
    case 'category': {
      const t = ({'1':'hatch_sedan','2':'suv_camioneta','3':'pickup_xl'} as Record<string,Vehicle>)[value] ?? explicitType(text)
      if (!t) return invalid()
      state.vehicleType = xl(state.vehicle ?? '') ? 'pickup_xl' : t
      if (!state.campaign && !selected()) return next('home')
      return state.bookingRequested ? requestSchedule() : next('detail')
    }
    case 'schedule':
      if (!state.vehicle || !state.vehicleType) return book()
      if (!state.campaign && cost(selected()!, state.vehicleType) === null) return handoff('Precio pendiente: confirmar manualmente.')
      if (state.quote && state.quote !== details()) {
        state.quote = details(); state.preference = undefined
        return reply('El precio o las condiciones cambiaron.\n' + prompt())
      }
      if (text.length > 160 || !/\d|lunes|martes|miercoles|jueves|viernes|sabado|domingo|manana|coordinar/.test(value)) return invalid()
      state.preference = text.trim(); state.bookingRequested = true
      return handoff('Solicitud de reserva: confirmar precio, condiciones y disponibilidad con el cliente.', '¡Gracias! Una persona de Fullshine continuará contigo para confirmar precio y disponibilidad. Aún no hay una hora reservada.')
  }
  return handoff('Estado no reconocido; revisión humana.')
}
