/**
 * Helper seguro para el Pixel de Meta.
 *
 * Problema que resuelve: el script del píxel se carga con estrategia
 * `afterInteractive`, así que puede no existir todavía cuando React ejecuta
 * los efectos de montaje. Antes, esas llamadas se perdían en silencio —
 * por eso `ViewContent` nunca llegaba a Meta aunque el código fuera correcto.
 *
 * Ahora los eventos que llegan antes de tiempo quedan en una cola y se
 * envían apenas fbq está disponible.
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

type Pendiente = { kind: 'track' | 'trackCustom'; event: string; params?: FbqParams }

const cola: Pendiente[] = []
let vaciando = false
const MAX_ESPERA_MS = 10_000
const INTERVALO_MS = 200

function enviarAhora(p: Pendiente): boolean {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return false
  try {
    window.fbq(p.kind, p.event, p.params)
    return true
  } catch {
    // El píxel nunca debe romper la página.
    return true
  }
}

/** Reintenta vaciar la cola hasta que fbq exista o se agote la espera. */
function vaciarCola() {
  if (vaciando) return
  vaciando = true

  const inicio = Date.now()
  const id = setInterval(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      while (cola.length) enviarAhora(cola.shift()!)
      clearInterval(id)
      vaciando = false
      return
    }
    if (Date.now() - inicio > MAX_ESPERA_MS) {
      // El usuario probablemente tiene un bloqueador de anuncios. Se descarta
      // sin ruido: es esperable y no debe afectar la experiencia.
      cola.length = 0
      clearInterval(id)
      vaciando = false
    }
  }, INTERVALO_MS)
}

function send(kind: 'track' | 'trackCustom', event: string, params?: FbqParams) {
  if (typeof window === 'undefined') return
  if (!META_PIXEL_ID) return

  const p: Pendiente = { kind, event, params }
  if (enviarAhora(p)) return

  cola.push(p)
  vaciarCola()
}

/** Evento estándar de Meta (los que aparecen en el Administrador de Eventos). */
export function track(event: MetaEvent, params?: FbqParams) {
  send('track', event, params)
}

/** Evento propio, para cosas que Meta no tiene por defecto. */
export function trackCustom(event: string, params?: FbqParams) {
  send('trackCustom', event, params)
}
