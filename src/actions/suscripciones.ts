'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { LAVADOS_POR_FRECUENCIA, calcularAvance, generarSlug, generarCodigo } from '@/lib/suscripciones'
import type { Frecuencia, Avance } from '@/lib/suscripciones'
import { hoyEnChile } from '@/lib/fechas'
import type { ActionResult } from '@/types'

/**
 * Suscripciones anuales de lavado.
 *
 * El cliente paga el año completo por adelantado y tiene derecho a un lavado
 * semanal o mensual. Los lavados los marca el administrador a mano — no pasan
 * por el sistema de reservas.
 *
 * El acceso del cliente funciona igual que el portal de socios: un código
 * compartido guardado en cookie httpOnly. No es autenticación de usuario;
 * pedirle una contraseña a alguien que solo quiere ver cuántos lavados le
 * quedan garantizaría que nadie use la herramienta.
 */

const COOKIE_PREFIX = 'suscripcion_'
const DIAS_SESION = 90

export type Suscripcion = {
  id: string
  slug: string
  access_code: string
  nombre: string
  telefono: string | null
  email: string | null
  vehiculo: string | null
  patente: string | null
  frecuencia: Frecuencia
  lavados_totales: number
  /** Lavados hechos antes de llevar el registro detallado. */
  lavados_previos: number
  monto_clp: number
  inicio: string
  termino: string
  activa: boolean
  notas: string | null
  created_at: string
}

export type Lavado = {
  id: string
  fecha: string
  detalle: string | null
  created_at: string
}

export type Extra = {
  id: string
  fecha: string
  descripcion: string
  precio_clp: number
  pagado: boolean
  created_at: string
}

// ── Guardia de administración ───────────────────────────────────────────

async function requiereAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const todas = cookies().getAll()
  const hay = todas.some(c =>
    c.value && (
      (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
      c.name === 'supabase-auth-token'
    )
  )
  return hay ? { ok: true } : { ok: false, error: 'Sesión expirada. Vuelve a entrar.' }
}

// ── Administración ──────────────────────────────────────────────────────

export async function getSuscripciones(): Promise<ActionResult<(Suscripcion & {
  realizados: number
  avance: Avance
  extras_mes: number
})[]>> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('activa', { ascending: false })
      .order('nombre')

    if (error) return { success: false, error: error.message }
    if (!subs?.length) return { success: true, data: [] }

    const ids = subs.map(s => s.id)
    const mesActual = hoyEnChile().substring(0, 7)

    const [{ data: lavados }, { data: extras }] = await Promise.all([
      supabase.from('subscription_washes').select('subscription_id').in('subscription_id', ids),
      supabase.from('subscription_extras').select('subscription_id, fecha, precio_clp').in('subscription_id', ids),
    ])

    const cuenta: Record<string, number> = {}
    for (const l of lavados ?? []) cuenta[l.subscription_id] = (cuenta[l.subscription_id] ?? 0) + 1

    const extrasMes: Record<string, number> = {}
    for (const e of extras ?? []) {
      if ((e.fecha ?? '').substring(0, 7) !== mesActual) continue
      extrasMes[e.subscription_id] = (extrasMes[e.subscription_id] ?? 0) + (e.precio_clp ?? 0)
    }

    return {
      success: true,
      data: (subs as Suscripcion[]).map(s => {
        // El total usado suma el arrastre manual y los lavados con fecha.
        const realizados = (s.lavados_previos ?? 0) + (cuenta[s.id] ?? 0)
        return {
          ...s,
          realizados,
          extras_mes: extrasMes[s.id] ?? 0,
          avance: calcularAvance({
            inicio: s.inicio,
            termino: s.termino,
            lavadosTotales: s.lavados_totales,
            realizados,
          }),
        }
      }),
    }
  } catch (e) {
    console.error('[getSuscripciones]', e)
    return { success: false, error: 'Error al cargar las suscripciones' }
  }
}

export async function crearSuscripcion(input: {
  nombre: string
  telefono?: string
  email?: string
  vehiculo?: string
  patente?: string
  frecuencia: Frecuencia
  lavados_totales?: number
  lavados_previos?: number
  monto_clp: number
  inicio: string
  notas?: string
}): Promise<ActionResult<{ slug: string; codigo: string }>> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    if (!input.nombre.trim()) return { success: false, error: 'El nombre es obligatorio' }
    if (!input.inicio) return { success: false, error: 'Falta la fecha de inicio' }

    const supabase = createAdminClient()

    // El término es un año exacto después del inicio.
    const t = new Date(`${input.inicio}T12:00:00Z`)
    t.setUTCFullYear(t.getUTCFullYear() + 1)
    const termino = t.toISOString().split('T')[0]

    // Slug único: si ya existe se le va agregando un sufijo.
    const base = generarSlug(input.nombre) || 'cliente'
    let slug = base
    for (let i = 2; i < 50; i++) {
      const { data } = await supabase.from('subscriptions').select('id').eq('slug', slug).maybeSingle()
      if (!data) break
      slug = `${base}-${i}`
    }

    const codigo = generarCodigo()

    const { error } = await supabase.from('subscriptions').insert({
      slug,
      access_code: codigo,
      nombre: input.nombre.trim(),
      telefono: input.telefono?.replace(/\D/g, '') || null,
      email: input.email?.trim() || null,
      vehiculo: input.vehiculo?.trim() || null,
      patente: input.patente?.trim().toUpperCase() || null,
      frecuencia: input.frecuencia,
      lavados_totales: input.lavados_totales ?? LAVADOS_POR_FRECUENCIA[input.frecuencia],
      lavados_previos: Math.max(0, input.lavados_previos ?? 0),
      monto_clp: input.monto_clp,
      inicio: input.inicio,
      termino,
      notas: input.notas?.trim() || null,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/suscripciones')
    return { success: true, data: { slug, codigo } }
  } catch (e) {
    console.error('[crearSuscripcion]', e)
    return { success: false, error: 'Error al crear la suscripción' }
  }
}

export async function actualizarSuscripcion(
  id: string,
  cambios: Partial<Pick<Suscripcion,
    'nombre' | 'telefono' | 'email' | 'vehiculo' | 'patente' |
    'lavados_totales' | 'lavados_previos' | 'monto_clp' | 'activa' | 'notas' | 'termino'>>
): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscriptions').update(cambios).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar' }
  }
}

export async function eliminarSuscripcion(id: string): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar' }
  }
}

// ── Lavados ─────────────────────────────────────────────────────────────

export async function getDetalle(id: string): Promise<ActionResult<{
  suscripcion: Suscripcion
  lavados: Lavado[]
  extras: Extra[]
  avance: Avance
}>> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }
  return leerDetalle(id)
}

/** Lectura compartida entre el panel de administración y el portal del cliente. */
async function leerDetalle(id: string): Promise<ActionResult<{
  suscripcion: Suscripcion
  lavados: Lavado[]
  extras: Extra[]
  avance: Avance
}>> {
  try {
    const supabase = createAdminClient()

    const { data: sub, error } = await supabase
      .from('subscriptions').select('*').eq('id', id).single()
    if (error || !sub) return { success: false, error: 'Suscripción no encontrada' }

    const [{ data: lavados }, { data: extras }] = await Promise.all([
      supabase.from('subscription_washes').select('*').eq('subscription_id', id).order('fecha', { ascending: false }),
      supabase.from('subscription_extras').select('*').eq('subscription_id', id).order('fecha', { ascending: false }),
    ])

    const s = sub as Suscripcion
    return {
      success: true,
      data: {
        suscripcion: s,
        lavados: (lavados ?? []) as Lavado[],
        extras: (extras ?? []) as Extra[],
        avance: calcularAvance({
          inicio: s.inicio,
          termino: s.termino,
          lavadosTotales: s.lavados_totales,
          realizados: (s.lavados_previos ?? 0) + (lavados?.length ?? 0),
        }),
      },
    }
  } catch (e) {
    console.error('[leerDetalle]', e)
    return { success: false, error: 'Error al cargar el detalle' }
  }
}

export async function registrarLavado(input: {
  subscription_id: string
  fecha?: string
  detalle?: string
}): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    const supabase = createAdminClient()

    // Aviso, no bloqueo: puede haber acordado lavados extra con el cliente.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('lavados_totales, lavados_previos')
      .eq('id', input.subscription_id).single()
    const { count } = await supabase
      .from('subscription_washes')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_id', input.subscription_id)

    const usados = (sub?.lavados_previos ?? 0) + (count ?? 0)

    const { error } = await supabase.from('subscription_washes').insert({
      subscription_id: input.subscription_id,
      fecha: input.fecha || hoyEnChile(),
      detalle: input.detalle?.trim() || null,
    })
    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/suscripciones')

    if (sub && usados >= sub.lavados_totales) {
      return { success: true, error: `Registrado, pero el cliente ya había usado sus ${sub.lavados_totales} lavados.` }
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Error al registrar el lavado' }
  }
}

export async function eliminarLavado(id: string): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscription_washes').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar' }
  }
}

// ── Servicios adicionales ───────────────────────────────────────────────

export async function registrarExtra(input: {
  subscription_id: string
  fecha?: string
  descripcion: string
  precio_clp: number
  pagado?: boolean
}): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }

  try {
    if (!input.descripcion.trim()) return { success: false, error: 'Falta la descripción' }

    const supabase = createAdminClient()
    const { error } = await supabase.from('subscription_extras').insert({
      subscription_id: input.subscription_id,
      fecha: input.fecha || hoyEnChile(),
      descripcion: input.descripcion.trim(),
      precio_clp: input.precio_clp,
      pagado: input.pagado ?? false,
    })
    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al registrar el servicio' }
  }
}

export async function marcarExtraPagado(id: string, pagado: boolean): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscription_extras').update({ pagado }).eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al guardar' }
  }
}

export async function eliminarExtra(id: string): Promise<ActionResult> {
  const auth = await requiereAdmin()
  if (!auth.ok) return { success: false, error: auth.error }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('subscription_extras').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar' }
  }
}

// ── Portal del cliente ──────────────────────────────────────────────────

export async function getSuscripcionPorSlug(slug: string): Promise<{ id: string; nombre: string } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('id, nombre')
    .eq('slug', slug)
    .eq('activa', true)
    .maybeSingle<{ id: string; nombre: string }>()
  return data ?? null
}

export async function tieneAccesoSuscripcion(slug: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('access_code')
    .eq('slug', slug)
    .eq('activa', true)
    .maybeSingle<{ access_code: string }>()

  if (!data) return false
  return cookies().get(`${COOKIE_PREFIX}${slug}`)?.value === data.access_code
}

export async function ingresarSuscripcion(slug: string, codigo: string): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('access_code')
    .eq('slug', slug)
    .eq('activa', true)
    .maybeSingle<{ access_code: string }>()

  if (!data) return { success: false, error: 'Este acceso no está disponible' }

  if (codigo.trim().toUpperCase() !== data.access_code.toUpperCase()) {
    return { success: false, error: 'Código incorrecto' }
  }

  cookies().set(`${COOKIE_PREFIX}${slug}`, data.access_code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: `/suscripcion/${slug}`,
    maxAge: DIAS_SESION * 24 * 60 * 60,
  })

  revalidatePath(`/suscripcion/${slug}`)
  return { success: true }
}

export async function salirSuscripcion(slug: string): Promise<ActionResult> {
  cookies().delete(`${COOKIE_PREFIX}${slug}`)
  revalidatePath(`/suscripcion/${slug}`)
  return { success: true }
}

/** Datos del portal. Solo responde si la cookie de acceso es válida. */
export async function getPanelCliente(slug: string): Promise<ActionResult<{
  suscripcion: Suscripcion
  lavados: Lavado[]
  extras: Extra[]
  avance: Avance
}>> {
  if (!(await tieneAccesoSuscripcion(slug))) {
    return { success: false, error: 'Sin acceso' }
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions').select('id').eq('slug', slug).maybeSingle<{ id: string }>()
  if (!data) return { success: false, error: 'No encontrada' }

  return leerDetalle(data.id)
}
