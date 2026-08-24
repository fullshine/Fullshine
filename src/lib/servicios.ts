/**
 * Categorías de servicio que NUNCA deben aparecer en el sitio público.
 *
 * Son convenios B2B con tarifas preferenciales, visibles solo desde el portal
 * de socios y el panel de administración.
 *
 * Vive acá y no en `actions/bookings.ts` porque los archivos marcados con
 * 'use server' solo pueden exportar funciones async: exportar una constante
 * desde ahí rompe el build de producción.
 */
export const CATEGORIAS_PRIVADAS = ['automotora']

export function esCategoriaPrivada(categoria?: string): boolean {
  return !!categoria && CATEGORIAS_PRIVADAS.includes(categoria)
}
