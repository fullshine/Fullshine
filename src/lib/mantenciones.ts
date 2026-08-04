import { createAdminClient } from '@/lib/supabase/server'
import { sendMaintenanceReminder, sendMaintenanceFollowUp } from '@/lib/whatsapp'

/**
 * Motor del calendario de mantención cerámica.
 *
 * Reglas de contacto:
 *   · Primer aviso  → 30 días ANTES de la fecha de vencimiento
 *   · Seguimiento   → 15 días después del primero, si sigue sin agendar
 *   · Se da por perdido → 45 días después del segundo, sin respuesta
 *
 * Todo queda registrado en `maintenance_schedule`, así que aunque esta
 * función corra varias veces al día nadie recibe el mismo mensaje dos veces.
 */

const DIAS_ANTES_PRIMER_AVISO = 30
const DIAS_ENTRE_AVISOS = 15
const DIAS_PARA_DARLO_POR_PERDIDO = 45
const MAX_ENVIOS_POR_CORRIDA = 25 // protege el número de WhatsApp

type FilaMantencion = {
  id: string
  due_at: string
  status: string
  contact_1_at: string | null
  contact_2_at: string | null
  customer: { full_name: string; phone: string } | null
  // Se pide la fila completa porque el proyecto usa brand/plate en unas
  // partes y make/license_plate en otras. Leemos el que exista.
  vehicle: Record<string, string | null> | null
}

const SELECT = `
  id, due_at, status, contact_1_at, contact_2_at,
  customer:customers(full_name, phone),
  vehicle:vehicles(*)
`

function nombrePila(nombre?: string | null): string {
  return nombre?.trim().split(' ')[0] ?? 'Hola'
}

function descripcionVehiculo(v: FilaMantencion['vehicle']): string {
  const marca = v?.make ?? v?.brand ?? ''
  const texto = `${marca} ${v?.model ?? ''}`.trim()
  return texto || 'tu vehículo'
}

function mesEnPalabras(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  })
}

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

export type ReporteMantenciones = {
  primer_aviso: string[]
  seguimiento: string[]
  marcados_perdidos: string[]
  errores: string[]
}

export async function procesarMantenciones(): Promise<ReporteMantenciones> {
  const supabase = createAdminClient()
  const reporte: ReporteMantenciones = {
    primer_aviso: [],
    seguimiento: [],
    marcados_perdidos: [],
    errores: [],
  }

  // ── 1. Primer aviso: vence dentro de los próximos 30 días ──────────────
  {
    const limite = new Date(Date.now() + DIAS_ANTES_PRIMER_AVISO * 86_400_000)
      .toISOString()
      .split('T')[0]

    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select(SELECT)
      .eq('status', 'pending')
      .is('contact_1_at', null)
      .lte('due_at', limite)
      .order('due_at')
      .limit(MAX_ENVIOS_POR_CORRIDA)

    if (error) {
      reporte.errores.push(`primer aviso: ${error.message}`)
    } else {
      for (const m of (data ?? []) as unknown as FilaMantencion[]) {
        if (!m.customer?.phone) {
          reporte.errores.push(`${m.id}: cliente sin teléfono`)
          continue
        }
        try {
          await sendMaintenanceReminder({
            phone: m.customer.phone,
            customerName: nombrePila(m.customer.full_name),
            vehicle: descripcionVehiculo(m.vehicle),
            dueMonth: mesEnPalabras(m.due_at),
          })
          await supabase
            .from('maintenance_schedule')
            .update({
              status: 'contacted',
              contact_1_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', m.id)
          reporte.primer_aviso.push(m.id)
        } catch (e) {
          reporte.errores.push(`${m.id} (aviso 1): ${(e as Error).message}`)
        }
      }
    }
  }

  // ── 2. Seguimiento: 15 días después del primero, sin agendar ───────────
  {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select(SELECT)
      .eq('status', 'contacted')
      .not('contact_1_at', 'is', null)
      .is('contact_2_at', null)
      .order('contact_1_at')
      .limit(MAX_ENVIOS_POR_CORRIDA)

    if (error) {
      reporte.errores.push(`seguimiento: ${error.message}`)
    } else {
      const listos = ((data ?? []) as unknown as FilaMantencion[]).filter(
        m => m.contact_1_at && diasDesde(m.contact_1_at) >= DIAS_ENTRE_AVISOS
      )

      for (const m of listos) {
        if (!m.customer?.phone) continue
        try {
          await sendMaintenanceFollowUp({
            phone: m.customer.phone,
            customerName: nombrePila(m.customer.full_name),
            vehicle: descripcionVehiculo(m.vehicle),
          })
          await supabase
            .from('maintenance_schedule')
            .update({
              contact_2_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', m.id)
          reporte.seguimiento.push(m.id)
        } catch (e) {
          reporte.errores.push(`${m.id} (aviso 2): ${(e as Error).message}`)
        }
      }
    }
  }

  // ── 3. Dar por perdidas las que no respondieron ────────────────────────
  // No se les vuelve a escribir automáticamente. Quedan en el panel para
  // que decidas si vale una llamada personal.
  {
    const corte = new Date(Date.now() - DIAS_PARA_DARLO_POR_PERDIDO * 86_400_000).toISOString()

    const { data, error } = await supabase
      .from('maintenance_schedule')
      .update({ status: 'lost', updated_at: new Date().toISOString() })
      .eq('status', 'contacted')
      .not('contact_2_at', 'is', null)
      .lte('contact_2_at', corte)
      .select('id')

    if (error) reporte.errores.push(`marcar perdidas: ${error.message}`)
    else reporte.marcados_perdidos = (data ?? []).map(r => r.id)
  }

  return reporte
}
