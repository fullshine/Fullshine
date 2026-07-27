/**
 * Helper seguro para el Pixel de Meta.
 *
 * - No revienta si fbq todavía no cargó, si el usuario tiene bloqueador
 *   de anuncios, o si estamos renderizando en el servidor.
 * - Si NEXT_PUBLIC_META_PIXEL_ID no está definido, todo queda en no-op.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''

type FbqParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Eventos estándar de Meta que usamos en Fullshine. */
export type MetaEvent =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Schedule'
  | 'Contact'
  | 'CompleteRegistration'

function send(kind: 'track' | 'trackCustom', event: string, params?: FbqParams) {
  if (typeof window === 'undefined') return
  if (!META_PIXEL_ID) return
  try {
    window.fbq?.(kind, event, params)
  } catch {
    // El pixel nunca debe romper la página.
  }
}

/** Evento estándar de Meta (los que aparecen en el Administrador de Eventos). */
export function track(event: MetaEvent, params?: FbqParams) {
  send('track', event, params)
}

/** Evento propio, para cosas que Meta no tiene por defecto. */
export function trackCustom(event: string, params?: FbqParams) {
  send('trackCustom', event, params)
}
