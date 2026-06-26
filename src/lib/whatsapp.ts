// WhatsApp via Green API (green-api.com)
// Credenciales en .env.local:
//   GREEN_API_INSTANCE_ID  → ID de la instancia (ej: 1101234567)
//   GREEN_API_TOKEN        → API token de la instancia
//   WHATSAPP_ADMIN_PHONE   → Número del admin sin + (ej: 56933654943)

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const API_TOKEN = process.env.GREEN_API_TOKEN
const ADMIN_PHONE = process.env.WHATSAPP_ADMIN_PHONE

// Formato requerido por Green API: {countrycode}{number}@c.us
function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('9') && digits.length === 9
    ? `56${digits}`
    : digits
  return `${normalized}@c.us`
}

async function sendMessage(to: string, message: string): Promise<void> {
  if (!INSTANCE_ID || !API_TOKEN) {
    console.log(`[WhatsApp] Sin credenciales Green API → ${to}:\n${message}`)
    return
  }

  const url = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: toChatId(to),
      message,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp] Error Green API:', err)
  }
}

// -------------------------------------------------------------------
// Confirmación al cliente
// -------------------------------------------------------------------
export async function sendBookingConfirmationToClient(params: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string   // "2026-06-27T09:00:00"
  vehicleMake: string
  vehicleModel: string
}): Promise<void> {
  const [date, time] = params.scheduledAt.split('T')
  const hora = time?.substring(0, 5) ?? ''
  const vehiculo = `${params.vehicleMake} ${params.vehicleModel}`.trim()

  const message =
    `¡Hola ${params.customerName}! 👋\n\n` +
    `Tu reserva en *Fullshine Detailing* está confirmada ✅\n\n` +
    `🔧 *Servicio:* ${params.serviceName}\n` +
    `📅 *Fecha:* ${date}\n` +
    `🕐 *Hora:* ${hora} hrs\n` +
    `🚗 *Vehículo:* ${vehiculo}\n\n` +
    `Te esperamos en Concepción & San Pedro de la Paz.\n` +
    `Cualquier consulta responde este mensaje. ¡Hasta pronto!`

  await sendMessage(params.phone, message)
}

// -------------------------------------------------------------------
// Aviso al admin cuando llega una nueva reserva
// -------------------------------------------------------------------
export async function sendNewBookingToAdmin(params: {
  customerName: string
  customerPhone: string
  serviceName: string
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
  vehicleLicensePlate: string
}): Promise<void> {
  if (!ADMIN_PHONE) {
    console.log('[WhatsApp] WHATSAPP_ADMIN_PHONE no configurado')
    return
  }

  const [date, time] = params.scheduledAt.split('T')
  const hora = time?.substring(0, 5) ?? ''
  const vehiculo = `${params.vehicleMake} ${params.vehicleModel}`.trim()
  const patente = params.vehicleLicensePlate || '—'

  const message =
    `🔔 *Nueva reserva Fullshine*\n\n` +
    `👤 *Cliente:* ${params.customerName}\n` +
    `📱 *Teléfono:* ${params.customerPhone}\n` +
    `🔧 *Servicio:* ${params.serviceName}\n` +
    `📅 *Fecha:* ${date}\n` +
    `🕐 *Hora:* ${hora} hrs\n` +
    `🚗 *Vehículo:* ${vehiculo} · ${patente}`

  await sendMessage(ADMIN_PHONE, message)
}

// -------------------------------------------------------------------
// Aviso de cancelación al cliente
// -------------------------------------------------------------------
export async function sendCancellationToClient(params: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
}): Promise<void> {
  const date = params.scheduledAt.substring(0, 10)

  const message =
    `Hola ${params.customerName}, te informamos que tu reserva de ` +
    `*${params.serviceName}* del ${date} ha sido cancelada.\n\n` +
    `Para reagendar visita fullshine.autos o responde este mensaje. ¡Disculpa los inconvenientes!`

  await sendMessage(params.phone, message)
}
