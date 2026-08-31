import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendReminderToClient, sendSameDayReminderToClient, getEstadoWhatsApp } from '@/lib/whatsapp'
import { puedeNotificar, modoSilencioso } from '@/lib/notificaciones'
import { sendPushToAdmin } from '@/lib/push'
import { procesarMantenciones, type ReporteMantenciones } from '@/lib/mantenciones'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Recordatorios automáticos por WhatsApp.
 *
 *   · 24 h — todas las citas de MAÑANA que aún no fueron recordadas
 *   · 2 h  — citas que empiezan dentro de las próximas 1 a 3 horas
 *   · Además dispara el calendario de mantención cerámica
 *
 * Es idempotente: cada envío marca su columna en `bookings`, así que
 * aunque el cron corra varias veces al día nadie recibe el mismo mensaje
 * dos veces.
 *
 * La tabla bookings guarda booking_date (date) + slot_start (time),
 * ambos en hora local de Chile.
 */

const TZ = 'America/Santiago'
const ESTADOS_VIGENTES = ['pending', 'confirmed']

/** 'YYYY-MM-DD' de una fecha, en hora de Chile. */
function claveFechaChile(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
}

/** 'HH:MM' actual en Chile. */
function horaChile(d: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d)
}

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

type FilaReserva = {
  id: string
  booking_date: string
  slot_start: string
  status: string
  reminder_24h_at: string | null
  reminder_2h_at: string | null
  customer: { full_name: string; phone: string } | null
  service: { name: string; category: string } | null
}

const SELECT = `
  id, booking_date, slot_start, status, reminder_24h_at, reminder_2h_at,
  customer:customers(full_name, phone),
  service:services(name, category)
`

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return req.headers.get('x-vercel-cron') !== null
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}` || req.headers.get('x-vercel-cron') !== null
}

/** Arma un ISO local con la fecha y hora de la reserva, para los mensajes. */
function momentoCita(f: FilaReserva): string {
  return `${f.booking_date}T${(f.slot_start ?? '10:00:00').substring(0, 8)}`
}

async function handler(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const ahora = new Date()

  const resultado = {
    ejecutado: ahora.toISOString(),
    whatsapp: '' as string,
    recordatorios_24h: [] as string[],
    recordatorios_2h: [] as string[],
    mantenciones: null as ReporteMantenciones | null,
    errores: [] as string[],
  }

  // ── Vigilante de WhatsApp ───────────────────────────────────────────────
  // Si Green API está caído (suscripción vencida, sesión desconectada), NADA
  // sale: ni confirmaciones, ni recordatorios, ni certificados. Antes eso se
  // descubría por casualidad, días después. Ahora avisa al toque.
  // Modo silencioso: se corta antes de gastar llamadas a Green API.
  if (await modoSilencioso()) {
    resultado.whatsapp = 'modo silencioso activo — no se envió nada'
    return NextResponse.json(resultado)
  }

  const estadoWa = await getEstadoWhatsApp()
  resultado.whatsapp = estadoWa.estado

  if (!estadoWa.ok) {
    resultado.errores.push(`WhatsApp caído: ${estadoWa.estado}`)
    await sendPushToAdmin(
      '🚨 WhatsApp desconectado',
      `Green API responde "${estadoWa.estado}". No se está enviando ningún mensaje.`,
      '/admin/dashboard'
    ).catch(e => console.error('[Push WhatsApp caído]', e?.message))

    // Sin canal no tiene sentido intentar enviar: se cortaría a mitad y
    // marcaría reservas como recordadas sin haberlo hecho.
    console.error('[cron recordatorios] abortado:', estadoWa.estado)
    return NextResponse.json(resultado, { status: 200 })
  }

  const hoy = claveFechaChile(ahora)
  const manana = claveFechaChile(new Date(ahora.getTime() + 24 * 3600 * 1000))

  // ── Tanda 1: citas de MAÑANA ────────────────────────────────────────────
  {
    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT)
      .is('reminder_24h_at', null)
      .in('status', ESTADOS_VIGENTES)
      .eq('booking_date', manana)
      .order('slot_start')

    if (error) {
      resultado.errores.push(`consulta 24h: ${error.message}`)
    } else {
      for (const b of ((data ?? []) as unknown as FilaReserva[])) {
        if (!b.customer?.phone) {
          resultado.errores.push(`${b.id}: cliente sin teléfono`)
          continue
        }
        // Respeta el modo silencioso y el flag por reserva (convenios B2B).
        const permiso = await puedeNotificar(b.id)
        if (!permiso.permitido) continue
        try {
          await sendReminderToClient({
            phone: b.customer.phone,
            customerName: b.customer.full_name?.split(' ')[0] ?? 'Hola',
            serviceName: b.service?.name ?? 'tu servicio',
            scheduledAt: momentoCita(b),
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

  // ── Tanda 2: citas de HOY que empiezan en 1 a 3 horas ───────────────────
  // Solo tiene efecto si el cron corre varias veces al día.
  {
    const minutosAhora = aMinutos(horaChile(ahora))

    const { data, error } = await supabase
      .from('bookings')
      .select(SELECT)
      .is('reminder_2h_at', null)
      .in('status', ESTADOS_VIGENTES)
      .eq('booking_date', hoy)
      .order('slot_start')

    if (error) {
      resultado.errores.push(`consulta 2h: ${error.message}`)
    } else {
      const proximas = ((data ?? []) as unknown as FilaReserva[]).filter(b => {
        const inicio = aMinutos((b.slot_start ?? '10:00').substring(0, 5))
        const faltan = inicio - minutosAhora
        return faltan >= 60 && faltan <= 180
      })

      for (const b of proximas) {
        if (!b.customer?.phone) continue
        const permiso = await puedeNotificar(b.id)
        if (!permiso.permitido) continue
        try {
          await sendSameDayReminderToClient({
            phone: b.customer.phone,
            customerName: b.customer.full_name?.split(' ')[0] ?? 'Hola',
            scheduledAt: momentoCita(b),
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

  // ── Tanda 3: calendario de mantención cerámica ──────────────────────────
  // Va en el mismo cron para no gastar el único job diario del plan gratuito.
  try {
    resultado.mantenciones = await procesarMantenciones()
  } catch (e) {
    resultado.errores.push(`mantenciones: ${(e as Error).message}`)
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
