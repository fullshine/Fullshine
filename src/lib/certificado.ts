/**
 * Certificado de preparación para vehículos de convenio.
 *
 * Vive acá y no en un archivo 'use server' porque esos solo pueden exportar
 * funciones async.
 *
 * El certificado es la versión pública: la que el socio publica junto a la
 * ficha de venta. No incluye el estado de recepción ni hallazgos técnicos
 * comprometedores — eso va en el informe interno.
 */

export type DatosCertificado = {
  folio: string
  emitido: string
  socio: string
  marca: string
  modelo: string
  anio: number | null
  color: string | null
  patente: string | null
  plan: string
  preparadoEl: string
  horas: number
  codigoGift: string
}

/** Trabajo que incluye cada plan del convenio. */
export const TAREAS_POR_PLAN: Record<string, { exterior: string[]; interior: string[] }> = {
  'Plan Pulido + Interior': {
    exterior: [
      'Lavado técnico con método de dos baldes',
      'Descontaminación química de carrocería',
      'Descontaminación mecánica con clay bar',
      'Pulido abrillantador 3 en 1',
      'Limpieza profunda de llantas y pasarruedas',
      'Encerado premium de protección',
      'Hidratación de plásticos exteriores',
      'Sellado de neumáticos',
    ],
    interior: [
      'Aspirado profundo de habitáculo y maletero',
      'Limpieza de asientos y cielo de tapiz',
      'Paneles de puertas y tablero',
      'Limpieza de ductos de ventilación',
      'Hidratación de plásticos y cueros',
      'Vidrios interiores y exteriores sin marcas',
      'Aromatización final',
    ],
  },
  'Plan Lavado Detallado': {
    exterior: [
      'Lavado premium terminación Full Supremo',
      'Descontaminación de ruedas',
      'Cera sintética premium de hasta 6 meses',
      'Sellado de neumáticos',
      'Vidrios exteriores sin marcas',
    ],
    interior: [
      'Aspirado profundo de habitáculo y maletero',
      'Limpieza de ductos de ventilación',
      'Cueros y plásticos hidratados',
      'Cielo de tapiz de cortesía',
      'Aromatización final',
    ],
  },
  'Plan Lavado para Entrega': {
    exterior: [
      'Lavado exterior con Snow Foam',
      'Encerado de protección',
      'Hidratación de neumáticos y plásticos exteriores',
    ],
    interior: [
      'Aspirado interior',
      'Limpieza de tablero y paneles',
      'Vidrios interiores',
    ],
  },
}

/** Los tres puntos positivos que se destacan según el plan aplicado. */
export const DESTACADOS_POR_PLAN: Record<string, { titulo: string; detalle: string }[]> = {
  'Plan Pulido + Interior': [
    { titulo: 'Pintura corregida',
      detalle: 'Rayones de lavado y marcas de remolino eliminados con pulido abrillantador. Brillo parejo en toda la carrocería.' },
    { titulo: 'Superficie descontaminada',
      detalle: 'Descontaminación química y mecánica. La pintura quedó lisa al tacto, libre de partículas incrustadas.' },
    { titulo: 'Interior acondicionado',
      detalle: 'Asientos, cielo, paneles y ductos limpios en profundidad. Plásticos y cueros hidratados.' },
  ],
  'Plan Lavado Detallado': [
    { titulo: 'Protección aplicada',
      detalle: 'Cera sintética premium con duración de hasta 6 meses sobre pintura limpia y descontaminada.' },
    { titulo: 'Ruedas descontaminadas',
      detalle: 'Llantas y neumáticos tratados y sellados, sin residuos de frenos incrustados.' },
    { titulo: 'Interior higienizado',
      detalle: 'Aspirado profundo, ductos de ventilación limpios y cielo de tapiz incluido.' },
  ],
  'Plan Lavado para Entrega': [
    { titulo: 'Listo para entrega',
      detalle: 'Lavado exterior con Snow Foam y encerado de protección, preparado para la entrega al comprador.' },
    { titulo: 'Exterior protegido',
      detalle: 'Neumáticos y plásticos exteriores hidratados, con terminación pareja.' },
    { titulo: 'Interior presentable',
      detalle: 'Aspirado, tablero y paneles limpios, vidrios interiores sin marcas.' },
  ],
}

/**
 * Folio correlativo del certificado.
 * Formato FA-AAAA-NNNN, donde NNNN sale de un contador por año.
 */
export function folioCertificado(anio: number, correlativo: number): string {
  return `FA-${anio}-${String(correlativo).padStart(4, '0')}`
}

/** Código de la gift card, derivado del folio para poder rastrear el origen. */
export function codigoGift(folio: string): string {
  return 'FS25-' + folio.replace(/^FA-\d{2}/, '').replace(/-/g, '')
}

export function urlGift(codigo: string): string {
  return `https://www.fullshine.autos/giftcard?c=${codigo}`
}

/** Duración en horas a partir de los bloques de la reserva. */
export function horasDeReserva(slotStart?: string | null, slotEnd?: string | null): number {
  if (!slotStart || !slotEnd) return 0
  const min = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    return hh * 60 + (mm || 0)
  }
  const d = min(slotEnd) - min(slotStart)
  return d > 0 ? Math.round((d / 60) * 10) / 10 : 0
}

export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
