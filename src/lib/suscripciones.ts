import { hoyEnChile, aFecha } from '@/lib/fechas'

/**
 * Cálculos del avance de una suscripción anual.
 *
 * Viven acá y no en `actions/suscripciones.ts` porque los archivos marcados
 * con 'use server' solo pueden exportar funciones async.
 */

export const LAVADOS_POR_FRECUENCIA = {
  semanal: 52,
  mensual: 12,
} as const

export type Frecuencia = keyof typeof LAVADOS_POR_FRECUENCIA

export const ETIQUETA_FRECUENCIA: Record<Frecuencia, string> = {
  semanal: 'Un lavado por semana',
  mensual: 'Un lavado al mes',
}

export type Avance = {
  /** Lavados ya registrados. */
  realizados: number
  /** Los que quedan del plan hasta que termine el año. */
  disponibles: number
  /** Cuántos le habrían correspondido a esta altura del año. */
  esperados: number
  /** esperados − realizados. Positivo = va atrasado, negativo = va adelantado. */
  diferencia: number
  /** Porcentaje del plan consumido, 0–100. */
  progreso: number
  /** Días que faltan para que termine la suscripción. */
  diasRestantes: number
  /** Ya pasó la fecha de término. */
  vencida: boolean
  /** Resumen en una frase para mostrarle al cliente. */
  mensaje: string
}

function diasEntre(desde: string, hasta: string): number {
  const ms = aFecha(hasta).getTime() - aFecha(desde).getTime()
  return Math.round(ms / 86_400_000)
}

export function calcularAvance(params: {
  inicio: string
  termino: string
  lavadosTotales: number
  realizados: number
}): Avance {
  const { inicio, termino, lavadosTotales, realizados } = params
  const hoy = hoyEnChile()

  const duracion = Math.max(1, diasEntre(inicio, termino))
  const transcurridos = Math.min(Math.max(0, diasEntre(inicio, hoy)), duracion)
  const diasRestantes = Math.max(0, diasEntre(hoy, termino))
  const vencida = hoy > termino

  // Cuántos lavados le tocarían si los hubiera usado parejo durante el año.
  const esperados = Math.floor((transcurridos / duracion) * lavadosTotales)

  const disponibles = Math.max(0, lavadosTotales - realizados)
  const diferencia = esperados - realizados
  const progreso = lavadosTotales > 0
    ? Math.min(100, Math.round((realizados / lavadosTotales) * 100))
    : 0

  let mensaje: string
  if (vencida) {
    mensaje = `Tu plan terminó. Usaste ${realizados} de ${lavadosTotales} lavados.`
  } else if (disponibles === 0) {
    mensaje = 'Ya usaste todos los lavados de tu plan.'
  } else if (diferencia >= 2) {
    mensaje = `Vas ${diferencia} lavados por debajo del ritmo del plan. Te quedan ${disponibles} y ${diasRestantes} días para usarlos.`
  } else if (diferencia <= -2) {
    mensaje = `Vas adelantado: usaste ${Math.abs(diferencia)} lavados más de lo que corresponde a esta fecha. Te quedan ${disponibles}.`
  } else {
    mensaje = `Vas al día. Te quedan ${disponibles} lavados y ${diasRestantes} días de plan.`
  }

  return { realizados, disponibles, esperados, diferencia, progreso, diasRestantes, vencida, mensaje }
}

/** Convierte "Juan Pérez" en "juan-perez" para usarlo en la URL. */
export function generarSlug(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/** Código de acceso corto y legible por teléfono. Sin O/0 ni I/1. */
export function generarCodigo(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const numeros = '23456789'
  let out = ''
  for (let i = 0; i < 3; i++) out += letras[Math.floor(Math.random() * letras.length)]
  for (let i = 0; i < 3; i++) out += numeros[Math.floor(Math.random() * numeros.length)]
  return out
}

/** Agrupa una lista por mes (YYYY-MM), del más reciente al más antiguo. */
export function agruparPorMes<T extends { fecha: string }>(items: T[]): { mes: string; etiqueta: string; items: T[] }[] {
  const acc: Record<string, T[]> = {}
  for (const it of items) {
    const mes = it.fecha.substring(0, 7)
    if (!acc[mes]) acc[mes] = []
    acc[mes].push(it)
  }
  return Object.keys(acc)
    .sort((a, b) => b.localeCompare(a))
    .map(mes => ({
      mes,
      etiqueta: aFecha(`${mes}-01`).toLocaleDateString('es-CL', {
        month: 'long', year: 'numeric', timeZone: 'UTC',
      }),
      items: acc[mes],
    }))
}
