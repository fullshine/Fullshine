import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendReminderToClient, sendSameDayReminderToClient } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Recordatorios automáticos por WhatsApp.
 *
 * Dos tandas en cada ejecución:
 *   · 24 h — todas las citas de MAÑANA que aún no fueron recordadas
 *   · 2 h  — citas que empiezan dentro de las próximas 1 a 3 horas
 *
 * Es idempotente: cada envío marca la columna correspondiente en `bookings`,
 * así que aunque el cron corra varias veces al día nadie recibe el mismo
 * mensaje dos veces.
 *
 * Zona horaria: Chile continental (UTC-4 en invierno, UTC-3 en verano).
 * Se resuelve con Intl para no depender de la zona del servidor.
 */

const TZ = 'America/Santiago'
const ESTADOS_VIGENTES = ['pending', 'confirmed']

/** Devuelve 'YYYY-MM-DD' de una fecha, en hora de Chile. */
function chileDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

type BookingRow = {
  id: string
  scheduled_at: string
  status: string
  reminder_24h_at: string | null
  reminder_2h_at: string | null
  customer: { full_name: string; phone: string } | null
  service: { name: string; category: string } | null
}

const SELECT = `
  id, scheduled_at, status, reminder_24h_at, reminder_2h_at,
  customer:customers(full_name, phone),
  service:services(name, category)
`

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  // Sin secreto configurado, solo se permite el cron interno de Vercel.
  if (!secret) return req.headers.get('x-vercel-cron') !== null
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}` || req.headers.get('x-vercel-cron') !== null
}

async function handler(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const ahora = new Date()

  const resultado = {
    ejecutado: ahora.toISOString(),
    recordatorios_24h: [] as string[],
    recordatorios_2h: [] as string[],
    errores: [] as string[],
  }

  // ── Tanda 1: citas de MAÑANA ────────────────────────────────────────────
  {
    const desde = new Date(ahora.getTime() + 6 * 60 * 60 * 1000)   // +6 h
    const hasta = new Date(ahora.getTime() + 48 * 60 * 60 * 1000)  // +48 h
    const manana = chileDateKey(new Date(ahora.getTime() + 24 * 60 * 60 * 1000))

    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT)
      .is('reminder_24h_at', null)
      .in('status', ESTADOS_VIGENTES)
      .gte('scheduled_at', desde.toISOString())
      .lte('scheduled_at', hasta.toISOString())
      .order('scheduled_at')

    if (error) {
      resultado.errores.push(`consulta 24h: ${error.message}`)
    } else {
      // Nos quedamos solo con las que caen mañana en hora de Chile
      const delDia = ((data ?? []) as unknown as BookingRow[]).filter(
        b => chileDateKey(new Date(b.scheduled_at)) === manana
      )

      for (const b of delDia) {
        if (!b.customer?.phone) {
          resultado.errores.push(`${b.id}: cliente sin teléfono`)
          continue
        }
        try {
          await sendReminderToClient({
            phone: b.customer.phone,
            customerName: b.customer.full_name?.split(' ')[0] ?? 'Hola',
            serviceName: b.service?.name ?? 'tu servicio',
            scheduledAt: b.scheduled_at,
            isFree: b.service?.category === 'revision',
          })
          await supabase
            .from('bookings')
            .update({ reminder_24h_at: new Date().toISOString() })
            .eq('id', b.id)
          resultado.recordatorios_24h.push(b.id)
        } catch (e) {
          resultado.errores.push(`${b.id} (24h): ${(e as Error).message}`)
        }
      }
    }
  }

  // ── Tanda 2: citas dentro de 1 a 3 horas ────────────────────────────────
  // Solo tiene efecto si el cron corre varias veces al día.
  {
    const desde = new Date(ahora.getTime() + 60 * 60 * 1000)
    const hasta = new Date(ahora.getTime() + 3 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT)
      .is('reminder_2h_at', null)
      .in('status', ESTADOS_VIGENTES)
      .gte('scheduled_at', desde.toISOString())
      .lte('scheduled_at', hasta.toISOString())
      .order('scheduled_at')

    if (error) {
      resultado.errores.push(`consulta 2h: ${error.message}`)
    } else {
      for (const b of ((data ?? []) as unknown as BookingRow[])) {
        if (!b.customer?.phone) continue
        try {
          await sendSameDayReminderToClient({
            phone: b.customer.phone,
            customerName: b.customer.full_name?.split(' ')[0] ?? 'Hola',
            scheduledAt: b.scheduled_at,
          })
          await supabase
            .from('bookings')
            .update({ reminder_2h_at: new Date().toISOString() })
            .eq('id', b.id)
          resultado.recordatorios_2h.push(b.id)
        } catch (e) {
          resultado.errores.push(`${b.id} (2h): ${(e as Error).message}`)
        }
      }
    }
  }

  console.log('[cron recordatorios]', JSON.stringify(resultado))
  return NextResponse.json(resultado)
}

export async function GET(req: NextRequest) {
  return handler(req)
}

export async function POST(req: NextRequest) {
  return handler(req)
}
