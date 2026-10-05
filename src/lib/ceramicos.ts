/** Identifica la duración del coating sin cambiar las categorías de reserva. */
export function isMetalCoat(service: { name?: string | null; description?: string | null }): boolean {
  return /metal\s*coat|1\s*año/i.test(service.name ?? '') || /metal\s*coat/i.test(service.description ?? '')
}
