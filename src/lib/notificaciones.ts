import { createAdminClient } from '@/lib/supabase/server'

/**
 * Control central de los WhatsApp automáticos.
 *
 * Hay tres niveles, del más amplio al más específico:
 *
 *   1. Modo silencioso global  → apaga TODO desde el dashboard.
 *   2. Flag por reserva        → `bookings.notificaciones_activas`.
 *   3. Decisión puntual        → el checkbox de cada formulario.
 *
 * Los tres tienen que dar el visto bueno para que salga un mensaje.
 *
 * Todo acá falla ABIERTO a propósito: si la migración 24 todavía no se
 * ejecutó, o la consulta falla, se permite el envío. Así el sistema se
 * comporta igual que antes en vez de quedarse mudo sin avisar.
 */

const CLAVE_SILENCIO = 'modo_silencioso'

/** Cache corto para no consultar la config en cada mensaje de un lote. */
let cache: { valor: boolean; hasta: number } | null = null
const CACHE_MS = 10_000

export async function modoSilencioso(): Promise<boolean> {
  if (cache && Date.now() < cache.hasta) return cache.valor

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('app_config')
      .select('valor')
      .eq('clave', CLAVE_SILENCIO)
      .maybeSingle()

    if (error) return false
    const valor = data?.valor === 'true'
    cache = { valor, hasta: Date.now() + CACHE_MS }
    return valor
  } catch {
    return false
  }
}

export async function setModoSilencioso(activo: boolean): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('app_config')
    .upsert(
      { clave: CLAVE_SILENCIO, valor: activo ? 'true' : 'false', updated_at: new Date().toISOString() },
      { onConflict: 'clave' }
    )
  cache = { valor: activo, hasta: Date.now() + CACHE_MS }
}

/**
 * ¿Se le puede escribir al cliente de esta reserva?
 *
 * Devuelve además el motivo, para poder mostrarlo en el panel en vez de
 * dejar al administrador pensando que el mensaje se envió.
 */
export async function puedeNotificar(
  bookingId: string
): Promise<{ permitido: boolean; motivo?: string }> {
  if (await modoSilencioso()) {
    return { permitido: false, motivo: 'El modo silencioso está activado en el dashboard' }
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('notificaciones_activas')
      .eq('id', bookingId)
      .maybeSingle()

    // Columna inexistente (migración pendiente) o error de red: se permite.
    if (error || !data) return { permitido: true }

    if (data.notificaciones_activas === false) {
      return { permitido: false, motivo: 'Esta reserva tiene los avisos al cliente desactivados' }
    }
    return { permitido: true }
  } catch {
    return { permitido: true }
  }
}

/** Invalida el cache tras cambiar la configuración desde otro proceso. */
export function limpiarCacheNotificaciones(): void {
  cache = null
}
