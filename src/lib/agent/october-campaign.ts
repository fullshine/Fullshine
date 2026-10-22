/** Oferta aprobada por Fullshine. No modifica descuentos ni reservas del catálogo. */
export const OCTOBER_CAMPAIGN = {
  id: 'rav4-octubre-2026',
  name: 'Pulido abrillantador + limpieza de tapiz Platino',
  startsAt: '2026-10-21T00:00:00-03:00',
  // Límite exclusivo: incluye todo el 31 de octubre en America/Santiago.
  endsAt: '2026-11-01T00:00:00-03:00',
  prices: { hatch_sedan: 169990, suv_camioneta: 189000, pickup_xl: 209990 },
  maxVehiclesPerDay: 2,
} as const

export function isOctoberCampaignActive(now: Date = new Date()): boolean {
  return now.getTime() >= Date.parse(OCTOBER_CAMPAIGN.startsAt)
    && now.getTime() < Date.parse(OCTOBER_CAMPAIGN.endsAt)
}

export function buildOctoberCampaignPrompt(now: Date = new Date()): string {
  if (!isOctoberCampaignActive(now)) return `# CAMPAÑA RAV4 OCTUBRE 2026 — NO VIGENTE
No ofrezcas precios de esta campaña para nuevas reservas. Haber consultado antes del cierre NO equivale a reservar.
Si el cliente dice tener una reserva promocional previa, deriva a una persona para verificarla; no la anules ni cambies su precio.`
  const prices = OCTOBER_CAMPAIGN.prices
  const money = (value: number) => '$' + value.toLocaleString('es-CL')
  return `# CAMPAÑA RAV4 OCTUBRE 2026 — OFERTA AUTORIZADA
Esta oferta es una fuente válida adicional al catálogo y prevalece para este paquete específico.
- Servicio: ${OCTOBER_CAMPAIGN.name}.
- Sedán/hatchback: ${money(prices.hatch_sedan)} CLP; SUV/camioneta: ${money(prices.suv_camioneta)} CLP; XL: ${money(prices.pickup_xl)} CLP.
- XL tiene prioridad sobre SUV/camioneta: Silverado, F-150, 4Runner y cualquier vehículo de tres corridas de asientos. Si no está clara la categoría, pregunta marca, modelo y número de corridas; no adivines.
- Solo en taller, Camilo Henríquez 381, Concepción. No aplica a domicilio.
- Tapiz Platino: limpieza profunda de asientos, techo y suelo, sin desmontar asientos; tratamiento de manchas y olores; paneles de puerta y maletero; higienización interior.
- Duración estimada del paquete: 5–6 horas. El pulido es abrillantador, no prometas corrección profunda, eliminación de todas las rayas ni eliminación total de manchas.
- Basta RESERVAR hasta el 31 de octubre de 2026 inclusive, hora de Chile; el servicio puede realizarse después. Una consulta o cotización no constituye reserva.
- Recepciones habituales: 09:00 o 14:00. Se permite entregar después del cierre cuando sea necesario; una recepción a las 14:00 puede terminar aproximadamente entre 19:00 y 20:00. Toda fecha y entrega quedan sujetas a confirmación humana.
- Capacidad máxima: dos vehículos por día, contando otros trabajos que ocupen capacidad. No tienes acceso a la agenda: no afirmes que quedan cupos ni que una hora está bloqueada.
- No acumules descuentos, no redondees estos precios ni inventes precio anterior, anticipo, condiciones de pago o escasez.

# CONVERSACIÓN DE LA CAMPAÑA
Si menciona reel, RAV4, promoción de octubre o este paquete, usa esta oferta. Para una consulta ambigua sobre una promoción, pregunta cuál vio.
Preséntate como asistente virtual. Haz una pregunta a la vez y aprovecha las respuestas ya entregadas.
1. Confirma marca/modelo y categoría (pregunta por las corridas cuando sea necesario).
2. Explica el paquete y su precio exacto; aclara taller y duración.
3. Resuelve dudas y pide aceptación del precio y condiciones.
4. Pregunta fecha y preferencia 09:00/14:00, como solicitud, nunca como disponibilidad confirmada.
5. Cuando conoce y acepta precio, taller y duración, y quiere reservar, inicia tu respuesta con [DERIVAR]. Indica que una persona confirmará disponibilidad y finalizará la reserva. Si falta fecha, puedes derivar igualmente indicando que falta coordinarla.
No envíes al formulario genérico para contratar este paquete: todavía no tiene este precio combinado. No registres ni prometas reservas; el humano cierra en el sistema existente.
En cualquier paso deriva si pide una persona, requiere evaluación de fotos/audio, o hay dudas que no puedas resolver.

# CONTEXTO DE LA OFERTA
Fecha actual de Chile: ${new Intl.DateTimeFormat('es-CL', {timeZone: 'America/Santiago', dateStyle: 'long'}).format(now)}.
El enlace informativo disponible hoy es https://www.fullshine.autos/ y la publicación https://www.instagram.com/p/DewH-JhPm-7/.
`
}
