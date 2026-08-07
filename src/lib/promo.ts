/**
 * Promoción vigente.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  PARA LANZAR UNA PROMO NUEVA: cambia solo PROMO_END y los porcentajes.
 *  El resto del sitio (barra superior, precios, formulario de reserva y el
 *  agente de WhatsApp) se actualiza solo.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * PROMO_END es una fecha ABSOLUTA, no un contador que se reinicia por
 * visitante. Eso importa: un reloj falso que siempre marca "quedan 20
 * minutos" destruye la credibilidad de una marca premium, y el cliente que
 * vuelve al día siguiente y ve el mismo contador entiende de inmediato que
 * es un truco.
 *
 * Formato: ISO con zona horaria de Chile (-04:00 en invierno, -03:00 en verano).
 */

// 6 de agosto de 2026, 23:59 hora de Chile.  ← EDITA ESTA LÍNEA
export const PROMO_END = new Date('2026-08-06T23:59:00-04:00').getTime()

/** Descuento sobre tratamientos cerámicos (0.20 = 20%). */
export const PROMO_CERAMICO = 0.20

/** Descuento sobre el resto de los servicios. 0 = sin descuento. */
export const PROMO_OTROS = 0

export const PROMO_LABEL = '20% OFF en tratamientos cerámicos'
export const PROMO_SHORT = '20% OFF'
/** Solo aplica a cerámicos: se usa para no mostrar la promo donde no corresponde. */
export const PROMO_SOLO_CERAMICO = PROMO_OTROS === 0

export function isPromoActive(): boolean {
  return Date.now() < PROMO_END
}

/** Milisegundos restantes. 0 si ya terminó. */
export function promoMsLeft(): number {
  return Math.max(0, PROMO_END - Date.now())
}

/** Descuento que corresponde a una categoría de servicio. */
export function promoDiscountFor(category?: string): number {
  if (!isPromoActive()) return 0
  return category === 'ceramico' ? PROMO_CERAMICO : PROMO_OTROS
}

/** Aplica el descuento y redondea a los $1.000 más cercanos. */
export function promoPrice(normal: number, discount: number): number {
  return Math.round((normal * (1 - discount)) / 1000) * 1000
}

export function formatCLP(value: number): string {
  return `$${value.toLocaleString('es-CL')}`
}
