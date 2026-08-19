'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPushToAdmin } from '@/lib/push'

/**
 * Postulaciones de trabajo.
 *
 * El CV va a un bucket PRIVADO de Supabase Storage. Para verlo se genera un
 * enlace firmado que expira: así el currículum de nadie queda expuesto en
 * internet con solo conocer la URL.
 */

const BUCKET = 'cvs'
const MAX_BYTES = 5 * 1024 * 1024
const TIPOS_OK = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

export type Postulacion = {
  id: string
  full_name: string
  phone: string
  email: string | null
  comuna: string | null
  area: string | null
  experiencia: string | null
  tiene_licencia: boolean
  cv_path: string | null
  cv_nombre: string | null
  estado: string
  notas: string | null
  created_at: string
}

function limpiarNombre(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-80)
}

export async function postular(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const full_name = String(formData.get('full_name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const comuna = String(formData.get('comuna') ?? '').trim()
    const area = String(formData.get('area') ?? '').trim()
    const experiencia = String(formData.get('experiencia') ?? '').trim()
    const tiene_licencia = formData.get('tiene_licencia') === 'on'
    const cv = formData.get('cv') as File | null

    if (!full_name || full_name.length < 3) {
      return { success: false, error: 'Escribe tu nombre completo' }
    }
    const digitos = phone.replace(/\D/g, '')
    if (digitos.length !== 9 && digitos.length !== 11) {
      return { success: false, error: 'El teléfono debe tener 9 dígitos (ej: 9 1234 5678)' }
    }

    const supabase = createAdminClient()

    // ── Subida del CV (opcional) ──
    let cv_path: string | null = null
    let cv_nombre: string | null = null

    if (cv && cv.size > 0) {
      if (cv.size > MAX_BYTES) {
        return { success: false, error: 'El archivo supera los 5 MB. Comprime el PDF e inténtalo de nuevo.' }
      }
      if (cv.type && !TIPOS_OK.includes(cv.type)) {
        return { success: false, error: 'Formato no admitido. Usa PDF, Word o una imagen.' }
      }

      const ruta = `${Date.now()}-${limpiarNombre(cv.name || 'cv.pdf')}`
      const { error: errUpload } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, cv, { contentType: cv.type || 'application/pdf', upsert: false })

      if (errUpload) {
        console.error('[postular] upload:', errUpload.message)
        return { success: false, error: `No se pudo subir el archivo: ${errUpload.message}` }
      }
      cv_path = ruta
      cv_nombre = cv.name
    }

    // ── Registro ──
    const { error } = await supabase.from('job_applications').insert({
      full_name, phone, comuna: comuna || null, area: area || null,
      email: email || null,
      experiencia: experiencia || null,
      tiene_licencia, cv_path, cv_nombre,
    })

    if (error) {
      console.error('[postular] insert:', error.message)
      return { success: false, error: 'No se pudo registrar tu postulación. Inténtalo de nuevo.' }
    }

    // Aviso al negocio. No debe romper la postulación si falla.
    await sendPushToAdmin(
      '👤 Nueva postulación',
      `${full_name}${area ? ` · ${area}` : ''}${cv_path ? ' · con CV' : ''}`,
      '/admin/postulaciones'
    ).catch(e => console.error('[postular] push:', e?.message))

    revalidatePath('/admin/postulaciones')
    return { success: true }
  } catch (e) {
    console.error('[postular]', e)
    return { success: false, error: 'Error inesperado. Escríbenos por WhatsApp si el problema persiste.' }
  }
}

// ── Panel de administración ────────────────────────────────────────────

export async function getPostulaciones() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return { success: false as const, error: error.message, data: [] as Postulacion[] }
  return { success: true as const, data: (data ?? []) as Postulacion[] }
}

/** Enlace temporal para descargar un CV. Expira en 5 minutos. */
export async function getEnlaceCV(
  path: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)
  if (error || !data?.signedUrl) {
    return { success: false, error: error?.message ?? 'No se pudo generar el enlace' }
  }
  return { success: true, url: data.signedUrl }
}

export async function actualizarPostulacion(id: string, cambios: { estado?: string; notas?: string }) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('job_applications')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/postulaciones')
  return { success: true }
}
