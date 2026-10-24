import { guidedReply, type GuidedState } from './guided-flow'
import { isOctoberCampaignActive } from './october-campaign'
import { SERVICE_CATEGORY_LABELS, compareServicePlans } from '@/lib/catalogo-servicios'
import { esCategoriaPrivada } from '@/lib/servicios'
import { promoDiscountFor, promoPrice } from '@/lib/promo'
import { isMetalCoat } from '@/lib/ceramicos'

export interface CatalogService {
  id: string; name: string; category: string; description?: string | null
  duration_hours?: number | null; is_active?: boolean
  prices: { vehicle_type: string; price_clp: number }[]
}
type Vehicle = 'hatch_sedan' | 'suv_camioneta' | 'pickup_xl'
export interface CatalogState {
  version: 2
  step: 'home' | 'categories' | 'years' | 'plans' | 'detail' | 'vehicle' | 'category' | 'accept' | 'schedule' | 'done'
  misses: number; category?: string; years?: number; options?: string[]; serviceId?: string
  vehicle?: string; vehicleType?: Vehicle; quote?: string; accepted?: boolean; preference?: string
}
export type SalesState = GuidedState | CatalogState
export interface SalesResult { state: SalesState; reply: string; handoff: boolean; handoffContext?: string }
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const money = (n: number) => '$' + n.toLocaleString('es-CL')
const labels = {hatch_sedan: 'Sedán/hatchback', suv_camioneta: 'SUV/camioneta', pickup_xl: 'XL'}
const order = ['lavado_detallado','tapiz','pulido','ceramico','mantencion','adicional','precompra','revision']
const nav = '\n\nMENÚ: inicio · VOLVER: paso anterior · 0: una persona'
const vehicleQuestion = 'Escribe la marca y modelo de tu vehículo (ejemplo: Toyota RAV4).'
const categoryQuestion = '¿Qué categoría corresponde?\n1. Sedán/hatchback\n2. SUV/camioneta\n3. XL: Silverado, F-150, 4Runner o cualquier vehículo de tres corridas.\nSi no sabes, escribe 0.'
const xl = (s: string) => /\b(silverado|f[ -]?150|4[ -]?runner|3 corridas|tres corridas)\b/.test(norm(s))
const fresh = (): CatalogState => ({version: 2, step: 'home', misses: 0})

export function catalogReply(previous: SalesState | null | undefined, text: string, catalog: CatalogService[], now = new Date()): SalesResult {
  const value = norm(text)
  // Existing campaign conversations retain their meaning and stored acceptance.
  if (previous?.version === 1 && !/^(menu|servicios|catalogo)$/.test(value) && !(previous.step === 'menu' && value === '2')) return guidedReply(previous, text, now)
  let state: CatalogState = previous?.version === 2 ? {...previous} : fresh()
  const services = catalog.filter(s => s.is_active !== false && !esCategoriaPrivada(s.category) && order.includes(s.category))
  const categories = order.filter(c => services.some(s => s.category === c))
  const selected = () => services.find(s => s.id === state.serviceId)
  const cost = (s: CatalogService, type: Vehicle) => {
    const p = s.prices?.find(p => p.vehicle_type === type)?.price_clp
    if (typeof p !== 'number' || !Number.isFinite(p) || p < 0) return null
    const discount = promoDiscountFor(s.category)
    return discount > 0 ? promoPrice(p, discount) : p
  }
  const duration = (s: CatalogService) => s.duration_hours && s.duration_hours > 0 ? `${s.duration_hours < 1 ? `${Math.round(s.duration_hours * 60)} minutos` : `${s.duration_hours} horas`} aproximadamente.` : 'Duración por confirmar con el equipo.'
  const details = (s: CatalogService) => `*${s.name}*\n${s.description || 'Consulta los detalles con el equipo.'}\nDuración: ${duration(s)}\n` + (Object.keys(labels) as Vehicle[]).map(t => `${labels[t]}: ${cost(s,t) === null ? 'consultar' : money(cost(s,t)!)}`).join('\n') + '\nEl resultado depende del estado del vehículo; el equipo evaluará manchas, rayas y condiciones especiales.'
  const quote = (s: CatalogService) => `*${s.name}* para ${labels[state.vehicleType!]}: *${money(cost(s,state.vehicleType!)!)}*.\nDuración: ${duration(s)}\nAtención en taller: Camilo Henríquez 381, Concepción. Si necesitas otra modalidad, escribe 0 para consultar.\nSujeto a confirmación de disponibilidad. Escribe ACEPTO para continuar o CAMBIAR para corregir el vehículo.`
  const prompt = (): string => {
    switch(state.step) {
      case 'home': return 'Soy el asistente automático de Fullshine. ¿Qué necesitas?\n' + (isOctoberCampaignActive(now) ? '1. Promoción pulido abrillantador + tapiz Platino\n' : '') + '2. Ver todos los servicios\n0. Hablar con una persona\nTambién puedes escribir LAVADO, TAPIZ, PULIDOS o CERÁMICO.'
      case 'categories': return 'Elige una categoría:\n' + state.options!.map((c,i) => `${i+1}. ${SERVICE_CATEGORY_LABELS[c]}`).join('\n')
      case 'years': return 'Elige protección cerámica:\n1. 1 año · Nasiol Metal Coat\n2. 3 años · Nasiol ZR53'
      case 'plans': return `*${SERVICE_CATEGORY_LABELS[state.category!]}*${state.years ? ` · ${state.years} año(s)` : ''}\n` + state.options!.map((id,i) => `${i+1}. ${services.find(s=>s.id===id)?.name ?? 'Opción no disponible'}`).join('\n') + '\nResponde con el número para ver detalles.'
      case 'detail': return details(selected()!) + '\n\n1. Cotizar mi vehículo y solicitar reserva\n2. Ver otras opciones'
      case 'vehicle': return vehicleQuestion
      case 'category': return categoryQuestion
      case 'accept': return state.quote!
      case 'schedule': return '¿Qué fecha y hora prefieres? Puedes indicar 09:00, 14:00 o «por coordinar». Es una preferencia, no un cupo disponible. El equipo confirmará horario y entrega según la duración del servicio; los trabajos largos pueden requerir dejar el vehículo más tiempo.'
      default: return 'Una persona continuará contigo.'
    }
  }
  const reply = (message = prompt()): SalesResult => ({state, reply: message + nav, handoff: false})
  const handoff = (reason: string, message = 'Te derivaré a una persona de Fullshine. El asistente queda pausado para esta conversación.'): SalesResult => {
    state = {...state, step: 'done'}
    return {state, reply: message, handoff: true, handoffContext: [reason,`Servicio: ${selected()?.name ?? 'por definir'}`,`Vehículo: ${state.vehicle ?? 'pendiente'}`,`Categoría: ${state.vehicleType ? labels[state.vehicleType] : 'pendiente'}`,`Cotización informada: ${state.quote ?? 'pendiente'}`,`Condiciones aceptadas: ${state.accepted ? 'sí' : 'no'}`,`Preferencia: ${state.preference ?? 'pendiente'}`,'No hay reserva confirmada ni cupo bloqueado.',`Último mensaje: ${text.slice(0,500)}`].join('\n')}
  }
  const next = (step: CatalogState['step']) => {state = {...state,step,misses:0}; return reply()}
  const showCategories = () => {state = {...fresh(),step:'categories',options:categories}; return categories.length ? reply() : handoff('Catálogo público no disponible.')}
  const showPlans = () => {
    const plans = services.filter(s=>s.category===state.category && (!state.years || isMetalCoat(s)===(state.years===1))).sort(compareServicePlans)
    state = {version:2, step:'plans', misses:0, category:state.category, years:state.years,options:plans.map(s=>s.id)}
    return plans.length ? reply() : handoff('No hay planes disponibles en esta selección.')
  }
  const enterCategory = (category: string) => {state={...fresh(),category}; return category==='ceramico' ? next('years') : showPlans()}
  const invalid = () => {state.misses++; return state.misses>=2 ? handoff('Consulta que requiere atención humana.') : reply('No pude identificar esa respuesta.\n'+prompt())}
  const makeQuote = () => {
    const s=selected()!
    if (!state.vehicleType || cost(s,state.vehicleType)===null) return handoff('Precio no disponible para esta categoría; cotizar manualmente.')
    state.accepted=false; state.preference=undefined; state.quote=quote(s); return next('accept')
  }
  if (/^(0|humano|persona|asesor|hablar con una persona)$/.test(value) || /\b(hablar con|reclamo|reclamar|devolucion)\b/.test(value)) return handoff('Solicita atención humana.')
  if (/^(stop|baja|parar|no me escribas|no quiero mas mensajes)$/.test(value)) return handoff('Solicita detener respuestas.', 'Entendido. Las respuestas automáticas quedan detenidas para esta conversación.')
  if (value.startsWith('[el cliente envio')) return handoff('Adjunto pendiente de evaluación humana.')
  if (state.step==='done') return handoff('Conversación derivada: requiere seguimiento humano.')
  if (/^(menu|inicio|reiniciar)$/.test(value)) {state=fresh();return reply()}
  if (/^(servicios|catalogo)$/.test(value) || (previous?.version===1 && previous.step==='menu' && value==='2')) return showCategories()
  // Never continue an old quote for a service that has been removed or made private.
  if (state.serviceId && !selected()) return handoff('El servicio seleccionado ya no está disponible en el catálogo público.')
  if (value==='volver') {
    if (state.step==='categories') {state=fresh();return reply()}
    if (state.step==='years' || state.step==='plans') return showCategories()
    if (state.step==='detail') return showPlans()
    if (state.step==='vehicle') return next('detail')
    if (state.step==='category' || state.step==='accept' || state.step==='schedule') {state.accepted=false;state.quote=undefined;state.vehicleType=undefined;state.preference=undefined;return next('vehicle')}
    return reply()
  }
  if (value==='cambiar' && state.serviceId) {state.accepted=false;state.vehicle=undefined;state.vehicleType=undefined;state.quote=undefined;state.preference=undefined;return next('vehicle')}
  if (/\b(domicilio|a casa)\b/.test(value)) return handoff('Solicita modalidad a domicilio: confirmar cobertura, servicio y condiciones.')
  if (/\b(donde|direccion|ubicacion)\b/.test(value)) return reply('El taller está en Camilo Henríquez 381, Concepción.\n\n'+prompt())
  if (selected() && /\b(incluye|incluido|precio|precios|valor|demora|duracion|desmontaje)\b/.test(value)) return reply(details(selected()!)+'\n\n'+prompt())
  if (state.step==='home' || state.step==='categories') {
    if (/\b(promo|promocion|reel|octubre)\b/.test(value) || (state.step==='home' && value==='1')) return guidedReply(null,'promo',now)
    const direct = categories.find(c => c===value || norm(SERVICE_CATEGORY_LABELS[c])===value) ?? (/^pulido$/.test(value)?'pulido':/^lavado de tapiz$/.test(value)?'tapiz':undefined)
    if (direct && categories.includes(direct)) return enterCategory(direct)
  }
  switch(state.step) {
    case 'home':
      if(value==='2')return showCategories()
      if(!previous || /^(hola|buenas|buenos dias|buenas tardes)[!. ]*$/.test(value))return reply()
      return invalid()
    case 'categories': {
      const c=state.options?.[Number(value)-1]; return /^\d+$/.test(value)&&c&&categories.includes(c) ? enterCategory(c) : invalid()
    }
    case 'years':
      if(!['1','2'].includes(value))return invalid()
      state.years=value==='1'?1:3; return showPlans()
    case 'plans': {
      const id=state.options?.[Number(value)-1]
      if(!/^\d+$/.test(value)||!id)return invalid()
      state.serviceId=id
      return selected() ? next('detail') : handoff('La opción elegida dejó de estar disponible.')
    }
    case 'detail':
      if(value==='1')return next('vehicle')
      if(value==='2')return showPlans()
      return invalid()
    case 'vehicle':
      if(text.length>120 || !/^[\p{L}\d][\p{L}\d .-]{2,119}$/u.test(text.trim()) || text.trim().split(/\s+/).length<2)return invalid()
      state.vehicle=text.trim()
      if(xl(text)){state.vehicleType='pickup_xl';return makeQuote()}
      return next('category')
    case 'category': {
      const t:Record<string,Vehicle>={'1':'hatch_sedan','2':'suv_camioneta','3':'pickup_xl'}
      if(!t[value])return invalid()
      state.vehicleType=xl(state.vehicle??'')?'pickup_xl':t[value];return makeQuote()
    }
    case 'accept':
      if(/^(no|no acepto|no gracias)$/.test(value))return handoff('No acepta las condiciones; ofrecer alternativa.')
      if(value!=='acepto')return invalid()
      if(!state.vehicleType || !state.vehicle || cost(selected()!,state.vehicleType)===null)return handoff('Cotización incompleta; revisión humana.')
      if(state.quote!==quote(selected()!)){const r=makeQuote();r.reply='Las condiciones del catálogo cambiaron. Revisa la cotización actualizada y vuelve a escribir ACEPTO.\n'+r.reply;return r}
      state.accepted=true;return next('schedule')
    case 'schedule':
      if(!state.accepted || !state.vehicleType || !state.vehicle)return handoff('Solicitud incompleta; revisar condiciones.')
      if(cost(selected()!,state.vehicleType)===null || state.quote!==quote(selected()!))return makeQuote()
      if(text.length>160 || !/\d|lunes|martes|miercoles|jueves|viernes|sabado|domingo|manana|coordinar/.test(value))return invalid()
      state.preference=text.trim()
      return handoff('Cliente listo para cierre: revisar duración, capacidad y disponibilidad antes de reservar.','¡Gracias! Una persona de Fullshine confirmará disponibilidad y finalizará la reserva contigo. Aún no hay una hora reservada.')
  }
  return handoff('Estado no reconocido; revisión humana.')
}
