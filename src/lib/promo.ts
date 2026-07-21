// Promoción de julio 2026: 25% cerámico, 10% resto de servicios.
// Al pasar la fecha, isPromoActive() devuelve false y la web vuelve
// a precios normales automáticamente (las páginas revalidan cada hora).

export const PROMO_END = new Date('2026-08-01T03:59:00Z').getTime() // 31 jul 23:59 Chile
export const PROMO_CERAMICO = 0.25
export const PROMO_OTROS = 0.10
export const PROMO_LABEL = 'Promo de julio'

export function isPromoActive(): boolean {
  return Date.now() < PROMO_END
}

/** Aplica el descuento y redondea a los $1.000 más cercanos */
export function promoPrice(normal: number, discount: number): number {
  return Math.round((normal * (1 - discount)) / 1000) * 1000
}

export function formatCLP(value: number): string {
  return `$${value.toLocaleString('es-CL')}`
}
