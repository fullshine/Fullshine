/**
 * Helpers de fecha para la agenda.
 *
 * Viven acá y no en `actions/admin.ts` porque los archivos marcados con
 * 'use server' solo pueden exportar funciones async.
 */

/**
 * Fecha de hoy en Chile, en formato YYYY-MM-DD.
 *
 * El servidor de Vercel corre en UTC: después de las 20:00 en Concepción,
 * `new Date().toISOString()` ya devuelve el día siguiente y la agenda se
 * saltaba un día sola. El locale en-CA se usa porque entrega ISO.
 */
export function hoyEnChile(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

/** Mediodía UTC como ancla: evita que un cambio de horario mueva el día. */
export function aFecha(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`)
}

export function aISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function sumarDias(iso: string, dias: number): string {
  const d = aFecha(iso)
  d.setUTCDate(d.getUTCDate() + dias)
  return aISO(d)
}

export const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** Capacidad del taller en minutos: 8–18 de lunes a viernes, 8–14 el sábado. */
export function capacidadMinutos(diaSemana: number): number {
  if (diaSemana === 0) return 0
  return diaSemana === 6 ? 6 * 60 : 10 * 60
}
