// =============================================
// FULLSHINE - Green API WhatsApp
// =============================================

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID!
const TOKEN = process.env.GREEN_API_TOKEN!
const API_URL = process.env.GREEN_API_URL ?? 'https://7107.api.greenapi.com'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('56') ? digits : `56${digits}`
}

async function sendMessage(phone: string, message: string): Promise<void> {
  const chatId = `${normalizePhone(phone)}@c.us`
  const url = `${API_URL}/waInstance${INSTANCE_ID}/sendMessage/${TOKEN}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Green API error: ${res.status} - ${err}`)
  }
}

function formatDateTime(scheduledAt: string): { date: string; time: string } {
  const d = new Date(scheduledAt)
  const date = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function fmtCLP(n: number): string {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

// --- Confirmación de reserva al cliente ---
export async function sendBookingConfirmationToClient({
  phone, customerName, serviceName, scheduledAt, vehicleMake, vehicleModel, totalPrice, paymentLink,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
  totalPrice?: number
  paymentLink?: string
}) {
  const { date, time } = formatDateTime(scheduledAt)
  const anticipo = totalPrice ? Math.round(totalPrice * 0.2) : null

  const message =
    `👋 ¡Hola ${customerName}!\n\n` +
    `✅ Tu reserva en *Fullshine Detailing* ha sido registrada.\n\n` +
    `🚗 *Vehículo:* ${vehicleMake} ${vehicleModel}\n` +
    `🛠️ *Servicio:* ${serviceName}\n` +
    `📅 *Fecha:* ${date}\n` +
    `🕐 *Hora:* ${time}\n\n` +
    (anticipo
      ? `💳 *Para hacer efectiva tu reserva*, debes cancelar el 20% de anticipo:\n` +
        `💰 *Total del servicio:* ${fmtCLP(totalPrice!)}\n` +
        `👉 *Anticipo a pagar (20%):* ${fmtCLP(anticipo)}\n` +
        (paymentLink ? `\n🔗 Paga aquí: ${paymentLink}\n` : '') +
        `\nUna vez recibido el pago tu reserva queda *100% confirmada*. ✅\n\n`
      : '') +
    `Si tienes alguna pregunta, responde este mensaje. ¡Te esperamos! 🙌`

  return sendMessage(phone, message)
}

// --- Nueva reserva al negocio ---
export async function sendNewBookingToAdmin({
  customerName, customerPhone, serviceName, scheduledAt, vehicleMake, vehicleModel, vehicleLicensePlate,
}: {
  customerName: string
  customerPhone: string
  serviceName: string
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
  vehicleLicensePlate?: string
}) {
  const branchPhone = process.env.NEXT_PUBLIC_BRANCH_PHONE ?? '56933654943'
  const { date, time } = formatDateTime(scheduledAt)
  const message =
    `🔔 *Nueva reserva Fullshine*\n\n` +
    `👤 *Cliente:* ${customerName}\n` +
    `📱 *Teléfono:* ${customerPhone}\n` +
    `🚗 *Vehículo:* ${vehicleMake} ${vehicleModel}${vehicleLicensePlate ? ` (${vehicleLicensePlate})` : ''}\n` +
    `🛠️ *Servicio:* ${serviceName}\n` +
    `📅 *Fecha:* ${date}\n` +
    `🕐 *Hora:* ${time}`
  return sendMessage(branchPhone, message)
}

// --- Recordatorio 24h antes ---
export async function sendReminderToClient({
  phone, customerName, serviceName, scheduledAt,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
}) {
  const { date, time } = formatDateTime(scheduledAt)
  const message =
    `⏰ *Recordatorio Fullshine*\n\n` +
    `¡Hola ${customerName}! Mañana tienes tu cita:\n\n` +
    `🛠️ *Servicio:* ${serviceName}\n` +
    `📅 *Fecha:* ${date}\n` +
    `🕐 *Hora:* ${time}\n\n` +
    `¡Te esperamos! 🚗✨`
  return sendMessage(phone, message)
}

// --- Cancelación al cliente ---
export async function sendCancellationToClient({
  phone, customerName, serviceName, scheduledAt,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
}) {
  const { date } = formatDateTime(scheduledAt)
  const message =
    `❌ *Reserva cancelada*\n\n` +
    `Hola ${customerName}, tu reserva de *${serviceName}* del ${date} ha sido cancelada.\n\n` +
    `Si quieres reagendar, visita fullshine.autos 🙌`
  return sendMessage(phone, message)
}

// --- Link de pago anticipo (desde Kanban) ---
export async function sendPaymentLinkToClient({
  phone, customerName, serviceName, totalPrice, paymentAmount, paymentLink, scheduledAt,
}: {
  phone: string
  customerName: string
  serviceName: string
  totalPrice: number
  paymentAmount: number
  paymentLink: string
  scheduledAt: string
}) {
  const { date, time } = formatDateTime(scheduledAt)
  const message =
    `💳 *Anticipo Fullshine Detailing*\n\n` +
    `Hola ${customerName}, para confirmar tu reserva necesitamos el 20% de anticipo:\n\n` +
    `🛠️ *Servicio:* ${serviceName}\n` +
    `📅 *Fecha:* ${date} a las ${time}\n` +
    `💰 *Total:* ${fmtCLP(totalPrice)}\n` +
    `📩 *Anticipo (20%):* ${fmtCLP(paymentAmount)}\n\n` +
    `👉 Paga aquí: ${paymentLink}\n\n` +
    `Una vez recibido el pago, tu reserva queda 100% confirmada. ✅`
  return sendMessage(phone, message)
}

// --- Solicitud de reseña Google ---
export async function sendReviewRequestToClient({
  phone, customerName, serviceName,
}: {
  phone: string
  customerName: string
  serviceName: string
}) {
  const message =
    `⭐ *¡Gracias ${customerName}!*\n\n` +
    `Esperamos que hayas quedado muy satisfecho con tu *${serviceName}* en Fullshine Detailing.\n\n` +
    `Si te gustó el resultado, nos ayudaría mucho si nos dejas una reseña en Google:\n` +
    `👉 https://g.page/r/CWuD0BGLfZCAEBM/review\n\n` +
    `¡Solo toma 1 minuto y nos ayuda mucho! 🙏`
  return sendMessage(phone, message)
}
