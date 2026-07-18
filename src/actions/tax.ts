'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

async function requireAuth(): Promise<boolean> {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  return allCookies.some(c =>
    c.value && (
      (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
      c.name === 'supabase-auth-token'
    )
  )
}

export interface TaxPeriod {
  month: string
  remanente: number
  ppm_rate: number
  precios_con_iva: boolean
}

export async function getTaxPeriod(month: string): Promise<ActionResult<TaxPeriod>> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' }
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('tax_periods')
      .select('*')
      .eq('month', month)
      .maybeSingle()

    return {
      success: true,
      data: data ?? { month, remanente: 0, ppm_rate: 1.0, precios_con_iva: false },
    }
  } catch {
    return { success: false, error: 'Error al cargar configuración' }
  }
}

export async function saveTaxPeriod(period: TaxPeriod): Promise<ActionResult> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('tax_periods')
      .upsert({ ...period, updated_at: new Date().toISOString() }, { onConflict: 'month' })
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/finanzas')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar configuración' }
  }
}
