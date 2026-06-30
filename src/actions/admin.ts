'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendCancellationToClient } from '@/lib/whatsapp'
import type { ActionResult, BookingStatus, DashboardStats, BookingWithRelations, Customer, Vehicle } from '@/types'
import { revalidatePath } from 'next/cache'

// --- AUTH GUARD ---

async function requireAuth(): Promise<{ authorized: true } | { authorized: false; error: string }> {
  try {
    // Read cookie directly — same check as middleware, no network round-trip
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const hasAuth = allCookies.some(c =>
      c.value && (
        (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
        c.name === 'supabase-auth-token'
      )
    )
    if (!hasAuth) {
      console.error('[requireAuth] no auth cookie found. cookies:', allCookies.map(c => c.name))
      return { authorized: false, error: 'No autorizado' }
    }
    return { authorized: true }
  } catch (e) {
    console.error('[requireAuth] error:', e)
    return { authorized: false, error: 'Error de autenticación' }
  }
}

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
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0]
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [todayRes, weekRes, revenueRes, pendingRes, confirmedRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('booking_date', today),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('booking_date', weekStart),
      supabase.from('bookings').select('total_price_clp').eq('status', 'completed').gte('booking_date', monthStart),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ])

    const revenueMonth = (revenueRes.data ?? []).reduce((sum, b) => sum + (b.total_price_clp ?? 0), 0)

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

// --- RECENT BOOKINGS ---

export async function getRecentBookings(): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar reservas recientes' }
    return { success: true, data: (data ?? []) as BookingWithRelations[] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- BOOKINGS ---

export async function getBookings(filters?: {
  status?: BookingStatus
  date?: string
  search?: string
}): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .order('slot_start', { ascending: true })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.date) query = query.eq('booking_date', filters.date)

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
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
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
          scheduledAt: booking.slot_start,
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
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
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
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
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

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: vehicles } = await supabase.from('vehicles').select('id').eq('customer_id', id)
    if (vehicles?.length) {
      const vehicleIds = vehicles.map((v: any) => v.id)
      await supabase.from('bookings').delete().in('vehicle_id', vehicleIds)
      await supabase.from('vehicles').delete().eq('customer_id', id)
    }
    await supabase.from('bookings').delete().eq('customer_id', id)
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

// --- VEHICLES ---

export async function getVehiclesByCustomer(customerId: string): Promise<ActionResult<Vehicle[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
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

// --- CRM KANBAN ---

export async function getAllBookings(): Promise<ActionResult<BookingWithRelations[]>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), vehicle:vehicles(*), service:services(*)')
      .not('status', 'eq', 'cancelled')
      .order('created_at', { ascending: false })
    if (error) return { success: false, error: 'Error al cargar reservas' }
    return { success: true, data: (data ?? []) as BookingWithRelations[] }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function moveBookingStage(
  bookingId: string,
  newStatus: string
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
    if (error) { console.error('[moveBookingStage]', error); return { success: false, error: error.message } }
    revalidatePath('/admin/kanban')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function sendPaymentLink(bookingId: string): Promise<ActionResult<{ paymentUrl: string }>> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), service:services(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }

    const total = booking.total_price_clp ?? 0
    const amount = Math.round(total * 0.2)
    const orderId = `FS-${bookingId.substring(0, 8)}-${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fullshine.autos'

    let paymentUrl = ''
    try {
      const { createPaymentLink } = await import('@/lib/flow')
      const result = await createPaymentLink({
        orderId,
        amount,
        subject: `Anticipo Fullshine - ${booking.service?.name ?? 'Detailing'}`,
        customerEmail: booking.customer?.email ?? undefined,
        urlReturn: `${baseUrl}/reservar/pago-exitoso`,
        urlConfirmation: `${baseUrl}/api/flow/webhook`,
      })
      paymentUrl = result.url

      await supabase.from('bookings').update({
        payment_link: paymentUrl,
        payment_amount: amount,
        flow_order_id: orderId,
        status: 'payment_sent',
        updated_at: new Date().toISOString(),
      }).eq('id', bookingId)
    } catch (flowErr) {
      console.error('[Flow]', flowErr)
      return { success: false, error: 'Error al crear link de pago en Flow' }
    }

    if (booking.customer?.phone) {
      const { sendPaymentLinkToClient } = await import('@/lib/whatsapp')
      sendPaymentLinkToClient({
        phone: booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName: booking.service?.name ?? '',
        totalPrice: total,
        paymentAmount: amount,
        paymentLink: paymentUrl,
        scheduledAt: booking.slot_start ?? '',
      }).catch(console.error)
    }

    revalidatePath('/admin/kanban')
    return { success: true, data: { paymentUrl } }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}

export async function sendReviewRequest(bookingId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authorized) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), service:services(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) return { success: false, error: 'Reserva no encontrada' }

    if (booking.customer?.phone) {
      const { sendReviewRequestToClient } = await import('@/lib/whatsapp')
      await sendReviewRequestToClient({
        phone: booking.customer.phone,
        customerName: booking.customer.full_name,
        serviceName: booking.service?.name ?? '',
      })
    }

    await supabase.from('bookings').update({
      status: 'review_sent',
      updated_at: new Date().toISOString(),
    }).eq('id', bookingId)

    revalidatePath('/admin/kanban')
    return { success: true }
  } catch {
    return { success: false, error: 'Error inesperado' }
  }
}
