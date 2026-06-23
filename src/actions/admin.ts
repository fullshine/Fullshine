'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendCancellationToClient } from '@/lib/whatsapp'
import type { ActionResult, BookingStatus, DashboardStats, BookingWithRelations, Customer, Vehicle } from '@/types'
import { revalidatePath } from 'next/cache'

// --- AUTH ---

export async function signIn(email: string, password: string): Promise<ActionResult> {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: 'Credenciales incorrectas' }
    return { success: true }
  } catch {
    return { success: false, error: 'Error de conexión' }
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch {
    return { success: false, error: 'Error al cerrar sesión' }
  }
}

// --- DASHBOARD ---

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [todayRes, weekRes, revenueRes, pendingRes, confirmedRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true })
        .gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
        .gte('scheduled_at', weekStart),
      supabase.from('bookings').select('total_price')
        .eq('status', 'completed').gte('scheduled_at', monthStart),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ])

    const revenueMonth = (revenueRes.data ?? []).reduce((sum, b) => sum + (b.total_price ?? 0), 0)

    return {
      success: true,
      data: {
        bookings_today: todayRes.count ?? 0,
        bookings_week: weekRes.count ?? 0,
        revenue_month: revenueMonth,
        pending_bookings: pendingRes.count ?? 0,
        confirmed_bookings: confirmedRes.count ?? 0,
      },
    }
  } catch {
    return { success: false, error: 'Error al cargar estadísticas' }
  }
}

// --- BOOKINGS ---

export async function getBookings(filters?: {
  status?: BookingStatus
  date?: string
  search?: string
}): Promise<ActionResult<BookingWithRelations[]>> {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        service:services(*)
      `)
      .order('scheduled_at', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.date) {
      const start = `${filters.date}T00:00:00`
      const end = `${filters.date}T23:59:59`
      query = query.gte('scheduled_at', start).lte('scheduled_at', end)
    }

    const { data, error } = await query
    if (error) return { success: false, error: 'Error al cargar reservas' }

    let result = (data ?? []) as BookingWithRelations[]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(b =>
        b.customer?.full_name?.toLowerCase().includes(q) ||
        b.customer?.phone?.includes(q) ||
        b.vehicle?.license_plate?.toLowerCase().includes(q)
      )
    }

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    if (status === 'cancelled') {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, customer:customers(full_name, phone), service:services(name)')
        .eq('id', bookingId)
        .single()

      if (booking?.customer?.phone) {
        sendCancellationToClient({
          phone: booking.customer.phone,
          customerName: booking.customer.full_name,
          serviceName: booking.service?.name ?? '',
          scheduledAt: booking.scheduled_at,
        }).catch(console.error)
      }
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) return { success: false, error: 'Error al actualizar estado' }
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- CUSTOMERS ---

export async function getCustomers(search?: string): Promise<ActionResult<Customer[]>> {
  try {
    const supabase = createAdminClient()
    let query = supabase.from('customers').select('*').order('full_name')
    if (search) query = query.ilike('full_name', `%${search}%`)
    const { data, error } = await query
    if (error) return { success: false, error: 'Error al cargar clientes' }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function updateCustomer(
  id: string,
  updates: Partial<Pick<Customer, 'full_name' | 'email' | 'phone' | 'notes'>>
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { success: false, error: 'Error al actualizar cliente' }
    revalidatePath('/admin/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- VEHICLES ---

export async function getVehiclesByCustomer(customerId: string): Promise<ActionResult<Vehicle[]>> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar vehículos' }
    return { success: true, data: data ?? [] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}
