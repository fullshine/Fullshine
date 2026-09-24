'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import {
  ESTADOS_FINALIZADOS, TOTAL_FIJOS, RETIRO_SOCIOS_OBJETIVO,
  resumir, basesUsables, autosParaEquilibrio, semanasFinancieras,
} from '@/lib/finanzas'
import type { Cierre, Resumen, SemanaFinanciera, Trabajo } from '@/lib/finanzas'
import { hoyEnChile } from '@/lib/fechas'
import type { ActionResult } from '@/types'

/**
 * Finanzas del mes.
 *
 * Los trabajos salen de `bookings` con las columnas REALES del esquema
 * (booking_date y total_price_clp, no completed_at ni total_price), y los
 * insumos de `expenses` con category='insumos'. Así estas cifras siempre
 * coinciden con el historial mensual del dashboard y con el panel de gastos.
 */

async function requiereAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const hay = cookies().getAll().some(c =>
    c.value && (
      (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
      c.name === 'supabase-auth-token'
    )
  )
  return hay ? { ok: true } : { ok: false, error: 'Sesión expirada. Vuelve a entrar.' }
}

export type PanelFinanzas = {
  periodo: string
  etiqueta: string
  mes: Resumen
  semanas: SemanaFinanciera[]
  bases: { ticket: number; insumoPorAuto: number; confiable: boolean }
  equilibrio: {
    fijos: number
    autosCubrirCostos: number | null
    autosConRetiro: number | null
    retiroObjetivo: number
    faltanCostos: number | null
    faltanRetiro: number | null
  }
  cierre: Cierre | null
}

export async function getPanelFinanzas(periodo?: string): Promise<ActionResult<PanelFinanzas>> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const hoy = hoyEnChile()
    const p = periodo ?? hoy.slice(0, 7)
    const [anio, mes] = p.split('-').map(Number)

    const desde = `${p}-01`
    const ultimo = new Date(anio, mes, 0).getDate()
    const hasta = `${p}-${String(ultimo).padStart(2, '0')}`

    const supabase = createAdminClient()

    const [trabajosRes, insumosRes, cierreRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('booking_date, total_price_clp')
        .in('status', ESTADOS_FINALIZADOS as unknown as string[])
        .gte('booking_date', desde)
        .lte('booking_date', hasta),
      supabase
        .from('expenses')
        .select('expense_date, amount, has_factura')
        .eq('category', 'insumos')
        .gte('expense_date', desde)
        .lte('expense_date', hasta),
      supabase
        .from('cierres_mensuales')
        .select('*')
        .eq('periodo', p)
        .maybeSingle(),
    ])

    if (trabajosRes.error) return { success: false, error: trabajosRes.error.message }

    const trabajos: Trabajo[] = (trabajosRes.data ?? [])
      .filter(b => b.booking_date)
      .map(b => ({ fecha: b.booking_date as string, monto: b.total_price_clp ?? 0 }))

    const insumos = (insumosRes.data ?? []).map(e => ({
      fecha: e.expense_date as string,
      monto: e.amount ?? 0,
      con_factura: !!e.has_factura,
    }))

    const resumenMes = resumir(trabajos, insumos)
    const bases = basesUsables(resumenMes)

    const autosCubrirCostos = autosParaEquilibrio(TOTAL_FIJOS, bases.ticket, bases.insumoPorAuto)
    const autosConRetiro = autosParaEquilibrio(
      TOTAL_FIJOS, bases.ticket, bases.insumoPorAuto, RETIRO_SOCIOS_OBJETIVO
    )

    return {
      success: true,
      data: {
        periodo: p,
        etiqueta: new Date(anio, mes - 1, 1)
          .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
        mes: resumenMes,
        semanas: semanasFinancieras(anio, mes - 1, trabajos, insumos, hoy),
        bases,
        equilibrio: {
          fijos: TOTAL_FIJOS,
          autosCubrirCostos,
          autosConRetiro,
          retiroObjetivo: RETIRO_SOCIOS_OBJETIVO,
          faltanCostos: autosCubrirCostos === null
            ? null : Math.max(0, autosCubrirCostos - resumenMes.autos),
          faltanRetiro: autosConRetiro === null
            ? null : Math.max(0, autosConRetiro - resumenMes.autos),
        },
        // Si la migración 28 aún no corre, la tabla no existe y esto queda null.
        cierre: (cierreRes.data as Cierre | null) ?? null,
      },
    }
  } catch (e) {
    console.error('[getPanelFinanzas]', e)
    return { success: false, error: 'Error al cargar las finanzas' }
  }
}

// ── Cierre mensual ──────────────────────────────────────────────────────

export async function guardarCierre(
  periodo: string,
  datos: Partial<Pick<Cierre,
    'depositos_banco' | 'ventas_sii_neto' | 'iva_pagado' | 'ppm_pagado' | 'retiro_socios' | 'notas'>>
): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()

    // Un mes cerrado no se edita: si se pudiera, el cierre no significaría nada.
    const { data: actual } = await supabase
      .from('cierres_mensuales').select('cerrado').eq('periodo', periodo).maybeSingle()

    if (actual?.cerrado) {
      return { success: false, error: 'Este mes está cerrado. Reábrelo antes de modificarlo.' }
    }

    const { error } = await supabase
      .from('cierres_mensuales')
      .upsert({ periodo, ...datos, updated_at: new Date().toISOString() }, { onConflict: 'periodo' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/finanzas')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar el cierre' }
  }
}

export async function cerrarMes(periodo: string): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('cierres_mensuales')
      .upsert({
        periodo,
        cerrado: true,
        cerrado_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'periodo' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/finanzas')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al cerrar el mes' }
  }
}

export async function reabrirMes(periodo: string): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('cierres_mensuales')
      .update({ cerrado: false, cerrado_at: null, updated_at: new Date().toISOString() })
      .eq('periodo', periodo)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/finanzas')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al reabrir el mes' }
  }
}
