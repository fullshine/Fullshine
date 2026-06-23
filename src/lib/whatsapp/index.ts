// =============================================
// FULLSHINE - Meta WhatsApp Cloud API
// =============================================

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!
const TOKEN = process.env.META_WHATSAPP_TOKEN!

interface TemplateMessage {
  to: string
  templateName: string
  languageCode: string
  components?: object[]
}

async function sendTemplateMessage({ to, templateName, languageCode, components = [] }: TemplateMessage) {
  const phone = to.replace(/\D/g, '')
  const normalizedPhone = phone.startsWith('56') ? phone : `56${phone}`

  const body = {
    messaging_product: 'whatsapp',
    to: normalizedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  }

  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${res.status} - ${err}`)
  }

  return res.json()
}

// --- TEMPLATE: Confirmación de reserva al cliente ---
export async function sendBookingConfirmationToClient({
  phone,
  customerName,
  serviceName,
  scheduledAt,
  vehicleMake,
  vehicleModel,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
}) {
  const date = new Date(scheduledAt)
  const formattedDate = date.toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })

  return sendTemplateMessage({
    to: phone,
    templateName: 'booking_confirmation_client',
    languageCode: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: serviceName },
          { type: 'text', text: `${vehicleMake} ${vehicleModel}` },
          { type: 'text', text: formattedDate },
          { type: 'text', text: formattedTime },
        ],
      },
    ],
  })
}

// --- TEMPLATE: Nueva reserva al negocio ---
export async function sendNewBookingToAdmin({
  customerName,
  customerPhone,
  serviceName,
  scheduledAt,
  vehicleMake,
  vehicleModel,
  vehicleLicensePlate,
}: {
  customerName: string
  customerPhone: string
  serviceName: string
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
  vehicleLicensePlate?: string
}) {
  const branchPhone = process.env.NEXT_PUBLIC_BRANCH_PHONE || '+56933654943'
  const date = new Date(scheduledAt)
  const formattedDate = date.toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })

  return sendTemplateMessage({
    to: branchPhone,
    templateName: 'new_booking_admin',
    languageCode: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: customerPhone },
          { type: 'text', text: serviceName },
          { type: 'text', text: `${vehicleMake} ${vehicleModel}${vehicleLicensePlate ? ` (${vehicleLicensePlate})` : ''}` },
          { type: 'text', text: formattedDate },
          { type: 'text', text: formattedTime },
        ],
      },
    ],
  })
}

// --- TEMPLATE: Recordatorio 24h antes ---
export async function sendReminderToClient({
  phone,
  customerName,
  serviceName,
  scheduledAt,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
}) {
  const date = new Date(scheduledAt)
  const formattedDate = date.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const formattedTime = date.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })

  return sendTemplateMessage({
    to: phone,
    templateName: 'booking_reminder_client',
    languageCode: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: serviceName },
          { type: 'text', text: formattedDate },
          { type: 'text', text: formattedTime },
        ],
      },
    ],
  })
}

// --- TEMPLATE: Cancelación al cliente ---
export async function sendCancellationToClient({
  phone,
  customerName,
  serviceName,
  scheduledAt,
}: {
  phone: string
  customerName: string
  serviceName: string
  scheduledAt: string
}) {
  const date = new Date(scheduledAt)
  const formattedDate = date.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return sendTemplateMessage({
    to: phone,
    templateName: 'booking_cancelled_client',
    languageCode: 'es',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: serviceName },
          { type: 'text', text: formattedDate },
        ],
      },
    ],
  })
}
