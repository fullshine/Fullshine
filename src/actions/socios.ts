'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Portal de socios comerciales.
 *
 * Acceso por código compartido guardado en una cookie httpOnly. No es
 * autenticación de usuario: son documentos comerciales entre dos empresas
 * que ya tienen relación. Obligar a gestionar contraseñas garantizaría que
 * la herramienta no se use.
 *
 * Los archivos viven en un bucket privado y se sirven con enlaces firmados
 * que expiran, nunca con URLs permanentes.
 */

const BUCKET = 'socios'
const COOKIE_PREFIX = 'socio_'
const DIAS_SESION = 60

export type Socio = {
  id: string
  slug: string
  name: string
  service_category: string
  activo: boolean
}

export type Documento = {
  id: string
  tipo: string
  titulo: string
  descripcion: string | null
  patente: string | null
  periodo: string | null
  monto_clp: number | null
  file_path: string
  file_name: string
  file_size: number | null
  pagada: boolean
  pagada_at: string | null
  created_at: string
}

export type VehiculoAtendido = {
  booking_id: string
  patente: string | null
  vehiculo: string
  servicio: string
  fecha: string
  estado: string
  total: number
}

// ── Acceso ──────────────────────────────────────────────────────────────

export async function getSocio(slug: string): Promise<Socio | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('partners')
    .select('id, slug, name, service_category, activo')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle<Socio>()
  return data ?? null
}

/** ¿La cookie de este socio coincide con su código vigente? */
export async function tieneAcceso(slug: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('partners')
    .select('access_code')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle<{ access_code: string }>()

  if (!data) return false
  return cookies().get(`${COOKIE_PREFIX}${slug}`)?.value === data.access_code
}

export async function ingresar(slug: string, codigo: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('partners')
    .select('access_code')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle<{ access_code: string }>()

  if (!data) return { success: false, error: 'Este acceso no está disponible' }

  if (codigo.trim().toUpperCase() !== data.access_code.toUpperCase()) {
    return { success: false, error: 'Código incorrecto' }
  }

  cookies().set(`${COOKIE_PREFIX}${slug}`, data.access_code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: `/socios/${slug}`,
    maxAge: DIAS_SESION * 24 * 60 * 60,
  })

  revalidatePath(`/socios/${slug}`)
  return { success: true }
}

export async function salir(slug: string) {
  cookies().delete(`${COOKIE_PREFIX}${slug}`)
  revalidatePath(`/socios/${slug}`)
  return { success: true }
}

// ── Contenido del portal ────────────────────────────────────────────────

export async function getDocumentos(partnerId: string, tipo?: string) {
  const supabase = createAdminClient()
  let q = supabase
    .from('partner_documents')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(300)

  if (tipo) q = q.eq('tipo', tipo)

  const { data, error } = await q
  if (error) return { success: false as const, error: error.message, data: [] as Documento[] }
  return { success: true as const, data: (data ?? []) as Documento[] }
}

/**
 * Historial de vehículos atendidos.
 * Se identifica por la categoría de servicios del socio: cada uno tiene la
 * suya con sus tarifas negociadas, así que el filtro es exacto.
 */
export async function getHistorial(serviceCategory: string) {
  const supabase = createAdminClient()

  const { data: servicios } = await supabase
    .from('services')
    .select('id, name')
    .eq('category', serviceCategory)

  const ids = (servicios ?? []).map(s => s.id)
  if (ids.length === 0) return { success: true as const, data: [] as VehiculoAtendido[] }

  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_date, status, total_price_clp, vehicle:vehicles(*), service:services(name)')
    .in('service_id', ids)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: false })
    .limit(300)

  if (error) return { success: false as const, error: error.message, data: [] as VehiculoAtendido[] }

  const filas: VehiculoAtendido[] = (data ?? []).map((b: any) => ({
    booking_id: b.id,
    // vehicles usa brand/plate en la base real; make/license_plate de respaldo
    patente: b.vehicle?.plate ?? b.vehicle?.license_plate ?? null,
    vehiculo: `${b.vehicle?.brand ?? b.vehicle?.make ?? ''} ${b.vehicle?.model ?? ''}`.trim() || 'Vehículo',
    servicio: b.service?.name ?? '—',
    fecha: b.booking_date ?? '',
    estado: b.status,
    total: b.total_price_clp ?? 0,
  }))

  return { success: true as const, data: filas }
}

/** Enlace temporal de descarga. Expira en 10 minutos. */
export async function getEnlaceDocumento(
  path: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600)
  if (error || !data?.signedUrl) {
    return { success: false, error: error?.message ?? 'No se pudo generar el enlace' }
  }
  return { success: true, url: data.signedUrl }
}

// ── Administración ──────────────────────────────────────────────────────

export async function getSocios() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('partners')
    .select('id, slug, name, service_category, activo')
    .order('name')

  if (error) return { success: false as const, error: error.message, data: [] as Socio[] }
  return { success: true as const, data: (data ?? []) as Socio[] }
}

function limpiarNombre(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-90)
}

export async function subirDocumento(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const partner_id = String(formData.get('partner_id') ?? '')
    const tipo = String(formData.get('tipo') ?? 'factura')
    const titulo = String(formData.get('titulo') ?? '').trim()
    const descripcion = String(formData.get('descripcion') ?? '').trim()
    const patente = String(formData.get('patente') ?? '').trim().toUpperCase()
    const periodo = String(formData.get('periodo') ?? '').trim()
    const montoRaw = String(formData.get('monto_clp') ?? '').replace(/\D/g, '')
    const archivos = formData.getAll('archivos') as File[]

    if (!partner_id) return { success: false, error: 'Selecciona el socio' }
    if (!titulo) return { success: false, error: 'Escribe un título' }

    const validos = archivos.filter(a => a && a.size > 0)
    if (validos.length === 0) return { success: false, error: 'Selecciona al menos un archivo' }

    const supabase = createAdminClient()

    for (const archivo of validos) {
      if (archivo.size > 10 * 1024 * 1024) {
        return { success: false, error: `"${archivo.name}" supera los 10 MB` }
      }

      const ruta = `${partner_id}/${Date.now()}-${limpiarNombre(archivo.name)}`
      const { error: errUpload } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, archivo, { contentType: archivo.type || undefined, upsert: false })

      if (errUpload) {
        console.error('[subirDocumento]', errUpload.message)
        return { success: false, error: `No se pudo subir "${archivo.name}": ${errUpload.message}` }
      }

      const { error: errInsert } = await supabase.from('partner_documents').insert({
        partner_id,
        tipo,
        // Con varios archivos, cada uno lleva su propio nombre como sufijo
        titulo: validos.length > 1 ? `${titulo} — ${archivo.name}` : titulo,
        descripcion: descripcion || null,
        patente: patente || null,
        periodo: periodo || null,
        monto_clp: montoRaw ? parseInt(montoRaw) : null,
        file_path: ruta,
        file_name: archivo.name,
        file_size: archivo.size,
      })

      if (errInsert) {
        console.error('[subirDocumento] insert:', errInsert.message)
        return { success: false, error: errInsert.message }
      }
    }

    revalidatePath('/admin/socios')
    return { success: true }
  } catch (e) {
    console.error('[subirDocumento]', e)
    return { success: false, error: (e as Error).message }
  }
}

/**
 * Marca una factura como pagada o pendiente.
 *
 * El socio ve el estado en su portal, en modo lectura. Funciona como
 * recordatorio silencioso: evita tener que escribir "¿me pagaron la del
 * viernes?", que es una conversación incómoda con un cliente que uno quiere
 * conservar.
 */
export async function marcarPago(id: string, pagada: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('partner_documents')
    .update({
      pagada,
      pagada_at: pagada ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/socios')
  return { success: true }
}

export async function eliminarDocumento(id: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('partner_documents')
    .select('file_path')
    .eq('id', id)
    .maybeSingle<{ file_path: string }>()

  if (data?.file_path) {
    await supabase.storage.from(BUCKET).remove([data.file_path])
  }

  const { error } = await supabase.from('partner_documents').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/socios')
  return { success: true }
}
