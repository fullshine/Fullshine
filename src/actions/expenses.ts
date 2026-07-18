'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ActionResult, Expense, ExpenseCategory } from '@/types'

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

export async function addExpense(data: {
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
}): Promise<ActionResult> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('expenses').insert(data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar gasto' }
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar gasto' }
  }
}

export async function getExpensesMonth(): Promise<ActionResult<Expense[]>> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' }
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)
      .order('expense_date', { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error al cargar gastos' }
  }
}
