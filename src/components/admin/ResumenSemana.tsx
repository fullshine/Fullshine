import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { DiaSemana } from '@/actions/admin'

interface Props {
  dias: DiaSemana[]
  seleccionada: string
  semanaAnterior: string
  semanaSiguiente: string
  totalReservas: number
  totalIngresos: number
  rotulo: string
}

/** Color de la barra según qué tan lleno está el día. */
function tono(ocupacion: number): string {
  if (ocupacion === 0) return 'bg-gray-200'
  if (ocupacion < 40) return 'bg-emerald-400'
  if (ocupacion < 75) return 'bg-amber-400'
  return 'bg-red-400'
}

export default function ResumenSemana({
  dias, seleccionada, semanaAnterior, semanaSiguiente,
  totalReservas, totalIngresos, rotulo,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Cabecera con navegación */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Link href={`/admin/agenda?date=${semanaAnterior}`}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shrink-0"
          aria-label="Semana anterior">
          ‹
        </Link>

        <div className="text-center min-w-0">
          <p className="text-sm font-semibold text-gray-900 capitalize truncate">{rotulo}</p>
          <p className="text-xs text-gray-500">
            {totalReservas} {totalReservas === 1 ? 'reserva' : 'reservas'}
            {totalIngresos > 0 && ` · ${formatCurrency(totalIngresos)}`}
          </p>
        </div>

        <Link href={`/admin/agenda?date=${semanaSiguiente}`}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shrink-0"
          aria-label="Semana siguiente">
          ›
        </Link>
      </div>

      {/* Los 7 días */}
      <div className="grid grid-cols-7 gap-1.5">
        {dias.map(d => {
          const activo = d.fecha === seleccionada

          return (
            <Link key={d.fecha} href={`/admin/agenda?date=${d.fecha}`}
              className={[
                'rounded-xl border p-2 text-center transition-colors',
                activo
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                  : d.cerrado
                    ? 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                    : 'border-gray-200 hover:bg-gray-50',
              ].join(' ')}>

              <p className={`text-[10px] uppercase tracking-wide ${d.esHoy ? 'text-brand-600 font-bold' : 'text-gray-400'}`}>
                {d.diaCorto}
              </p>

              <p className={[
                'text-lg font-bold leading-tight',
                d.esHoy ? 'text-brand-600' : d.cerrado ? 'text-gray-300' : 'text-gray-900',
              ].join(' ')}>
                {d.numero}
              </p>

              {/* Cantidad de reservas */}
              <p className={[
                'text-xs font-semibold mt-0.5',
                d.cantidad === 0 ? 'text-gray-300' : 'text-gray-700',
              ].join(' ')}>
                {d.cantidad === 0 ? '—' : d.cantidad}
              </p>

              {/* Barra de ocupación */}
              <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${tono(d.ocupacion)}`}
                  style={{ width: `${Math.max(d.ocupacion, d.cantidad > 0 ? 8 : 0)}%` }} />
              </div>
            </Link>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        El número es la cantidad de reservas. La barra muestra cuántas horas del día están tomadas.
      </p>
    </div>
  )
}
