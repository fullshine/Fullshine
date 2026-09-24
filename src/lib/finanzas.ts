/**
 * Finanzas · configuración y cálculos
 *
 * Vive acá y no en `actions/finanzas.ts` porque los archivos marcados con
 * 'use server' solo pueden exportar funciones async.
 *
 * Decisión de diseño: los gastos de insumos NO tienen tabla propia. Salen de
 * `expenses` con category='insumos', que es la tabla que ya usas en el panel
 * de gastos. Tener dos lugares donde anotar lo mismo garantiza que tarde o
 * temprano los números no cuadren según dónde lo hayas registrado.
 */

// ── Costos fijos mensuales ──────────────────────────────────────────────
// Revísalos cada cierto tiempo: si suben y no se actualizan acá, el punto
// de equilibrio queda optimista y las decisiones salen mal.

export const COSTOS_FIJOS: { nombre: string; monto: number }[] = [
  { nombre: 'Empleados', monto: 900_000 },
  { nombre: 'Arriendo', monto: 400_000 },
  { nombre: 'Camioneta', monto: 350_000 },
  { nombre: 'Luz', monto: 130_000 },
  { nombre: 'Telefonía', monto: 100_000 },
  { nombre: 'Contador', monto: 35_000 },
]

export const TOTAL_FIJOS = COSTOS_FIJOS.reduce((s, c) => s + c.monto, 0)

/** Lo que los socios quieren retirar al mes, entre los dos. */
export const RETIRO_SOCIOS_OBJETIVO = 1_000_000

/** Porcentaje de cada venta que conviene apartar para IVA + PPM. */
export const TASA_APARTAR_IMPUESTOS = 0.12

/** Meta de autos por semana. */
export const META_AUTOS_SEMANA = 3

/** Referencias para cuando el mes aún tiene pocos datos. */
export const TICKET_REFERENCIA = 208_000
export const INSUMO_POR_AUTO_REFERENCIA = 20_000

/** Umbrales del semáforo de insumos sobre ventas. */
export const INSUMOS_PCT_ALERTA = 0.13
export const INSUMOS_PCT_PELIGRO = 0.18

/** Diferencia aceptable entre lo que dice el sistema y lo que entró al banco. */
export const TOLERANCIA_CUADRE = 0.03

/** Día del mes en que toca cerrar el mes anterior. */
export const DIA_CIERRE = 5

/**
 * Estados que cuentan como trabajo terminado.
 *
 * Incluye 'review_sent' porque es una etapa POSTERIOR a completada en el
 * kanban: si solo se contara 'completed', cada vez que pides una reseña el
 * trabajo desaparecería de los ingresos.
 */
export const ESTADOS_FINALIZADOS = ['completed', 'review_sent'] as const

// ── Tipos ───────────────────────────────────────────────────────────────

export type Trabajo = { fecha: string; monto: number }

export type Cierre = {
  periodo: string
  depositos_banco: number | null
  ventas_sii_neto: number | null
  iva_pagado: number | null
  ppm_pagado: number | null
  retiro_socios: number | null
  notas: string | null
  cerrado: boolean
  cerrado_at: string | null
}

export type Resumen = {
  autos: number
  ventas: number
  ticket: number
  insumos: number
  insumosPct: number
  insumoPorAuto: number
  pctConFactura: number
}

export type SemanaFinanciera = {
  numero: number
  desde: string
  hasta: string
  autos: number
  ventas: number
  ticket: number
  insumos: number
  apartarImpuestos: number
  cumpleMeta: boolean
  enCurso: boolean
}

// ── Utilidades de fecha ─────────────────────────────────────────────────

/** 'YYYY-MM-DD' a Date local. Evita el corrimiento de un día por UTC. */
export function fechaLocal(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function isoDia(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** Semanas de lunes a domingo recortadas al mes. */
export function semanasDelMes(anio: number, mes: number): { desde: string; hasta: string }[] {
  const semanas: { desde: string; hasta: string }[] = []
  const ultimoDia = new Date(anio, mes + 1, 0).getDate()
  let dia = 1

  while (dia <= ultimoDia) {
    const inicio = new Date(anio, mes, dia)
    // getDay(): 0 = domingo. Días que faltan para llegar al domingo.
    const hastaDomingo = (7 - inicio.getDay()) % 7
    const finDia = Math.min(dia + hastaDomingo, ultimoDia)
    semanas.push({ desde: isoDia(inicio), hasta: isoDia(new Date(anio, mes, finDia)) })
    dia = finDia + 1
  }
  return semanas
}

// ── Cálculos ────────────────────────────────────────────────────────────

export function resumir(
  trabajos: Trabajo[],
  insumos: { fecha: string; monto: number; con_factura: boolean }[],
  desde?: string,
  hasta?: string,
): Resumen {
  const dentro = (f: string) => (!desde || f >= desde) && (!hasta || f <= hasta)

  const t = trabajos.filter(x => dentro(x.fecha))
  const c = insumos.filter(x => dentro(x.fecha))

  const autos = t.length
  const ventas = t.reduce((s, x) => s + x.monto, 0)
  const totalInsumos = c.reduce((s, x) => s + x.monto, 0)
  const conFactura = c.filter(x => x.con_factura).reduce((s, x) => s + x.monto, 0)

  return {
    autos,
    ventas,
    ticket: autos ? Math.round(ventas / autos) : 0,
    insumos: totalInsumos,
    insumosPct: ventas ? totalInsumos / ventas : 0,
    insumoPorAuto: autos ? Math.round(totalInsumos / autos) : 0,
    pctConFactura: totalInsumos ? conFactura / totalInsumos : 0,
  }
}

/**
 * Con pocos autos el promedio del mes engaña: un solo cerámico Elite dispara
 * el ticket y el punto de equilibrio sale irreal. Bajo 5 autos se usan las
 * referencias históricas.
 */
export function basesUsables(r: Resumen) {
  const confiable = r.autos >= 5
  return {
    ticket: confiable ? r.ticket : TICKET_REFERENCIA,
    insumoPorAuto: confiable && r.insumos > 0 ? r.insumoPorAuto : INSUMO_POR_AUTO_REFERENCIA,
    confiable,
  }
}

/**
 * Autos necesarios para cubrir los costos fijos, y opcionalmente el retiro.
 * Devuelve null si cada auto pierde plata: ahí no hay volumen que salve.
 */
export function autosParaEquilibrio(
  fijos: number,
  ticket: number,
  insumoPorAuto: number,
  retiro = 0,
): number | null {
  const margen = ticket - insumoPorAuto
  if (margen <= 0) return null
  return Math.ceil((fijos + retiro) / margen)
}

export function semanasFinancieras(
  anio: number,
  mes: number,
  trabajos: Trabajo[],
  insumos: { fecha: string; monto: number; con_factura: boolean }[],
  hoy: string,
): SemanaFinanciera[] {
  return semanasDelMes(anio, mes).map((s, i) => {
    const r = resumir(trabajos, insumos, s.desde, s.hasta)
    return {
      numero: i + 1,
      desde: s.desde,
      hasta: s.hasta,
      autos: r.autos,
      ventas: r.ventas,
      ticket: r.ticket,
      insumos: r.insumos,
      apartarImpuestos: Math.round(r.ventas * TASA_APARTAR_IMPUESTOS),
      cumpleMeta: r.autos >= META_AUTOS_SEMANA,
      enCurso: hoy >= s.desde && hoy <= s.hasta,
    }
  })
}

/** Semáforo del gasto en insumos respecto de las ventas. */
export function estadoInsumos(pct: number): 'bien' | 'alerta' | 'peligro' {
  if (pct >= INSUMOS_PCT_PELIGRO) return 'peligro'
  if (pct >= INSUMOS_PCT_ALERTA) return 'alerta'
  return 'bien'
}

/** ¿Lo que dice el sistema cuadra con lo que entró al banco? */
export function cuadra(plataforma: number, banco: number): boolean {
  if (!plataforma) return banco === 0
  return Math.abs(plataforma - banco) / plataforma <= TOLERANCIA_CUADRE
}
