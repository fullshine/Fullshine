import { formatCurrency } from '@/lib/utils'
import type { MesHistorico } from '@/actions/admin'

/**
 * Historial de ingresos mensuales.
 *
 * Barras proporcionales al mejor mes del período: permite comparar de un
 * vistazo sin necesidad de leer cada cifra. Se cuenta el trabajo finalizado,
 * no el agendado.
 */
export default function HistorialMensual({ meses }: { meses: MesHistorico[] }) {
  const conVentas = meses.filter(m => m.ingresos > 0)
  const maximo = Math.max(...meses.map(m => m.ingresos), 1)

  const totalPeriodo = meses.reduce((s, m) => s + m.ingresos, 0)
  const promedio = conVentas.length > 0 ? Math.round(totalPeriodo / conVentas.length) : 0
  const mejor = conVentas.length > 0
    ? conVentas.reduce((a, b) => (b.ingresos > a.ingresos ? b : a))
    : null

  if (conVentas.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-bold text-gray-900">Historial mensual</h2>
        <p className="mt-2 text-sm text-gray-500">
          Todavía no hay trabajos finalizados registrados. Los meses aparecen
          acá a medida que completas reservas en el CRM.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-bold text-gray-900">Historial mensual</h2>
        <p className="text-xs text-gray-500">
          Desde {meses[0]?.etiqueta ?? '—'} · trabajos finalizados
        </p>
      </div>

      {/* Resumen del período */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500">Total período</p>
          <p className="mt-0.5 text-lg font-black text-gray-900">{formatCurrency(totalPeriodo)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500">Promedio mensual</p>
          <p className="mt-0.5 text-lg font-black text-gray-900">{formatCurrency(promedio)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500">Mejor mes</p>
          <p className="mt-0.5 text-sm font-black text-gray-900">{mejor?.etiqueta.split(' ')[0]}</p>
          <p className="text-xs text-gray-500">{formatCurrency(mejor?.ingresos ?? 0)}</p>
        </div>
      </div>

      {/* Barras */}
      <div className="space-y-2.5">
        {meses.map((m, i) => {
          const ancho = Math.round((m.ingresos / maximo) * 100)
          const actual = i === meses.length - 1
          return (
            <div key={m.periodo}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className={actual ? 'font-bold text-gray-900' : 'text-gray-600'}>
                  {m.etiqueta}
                  {actual && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-amber-600">en curso</span>}
                </span>
                <span className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className={`font-bold ${actual ? 'text-amber-600' : 'text-gray-900'}`}>
                    {formatCurrency(m.ingresos)}
                  </span>
                  {m.variacion !== null && m.ingresos > 0 && (
                    <span className={`text-xs font-semibold ${
                      m.variacion > 0 ? 'text-green-600' : m.variacion < 0 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {m.variacion > 0 ? '↑' : m.variacion < 0 ? '↓' : '='}
                      {Math.abs(m.variacion)}%
                    </span>
                  )}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${actual ? 'bg-amber-400' : 'bg-gray-800'}`}
                  style={{ width: `${ancho}%` }}
                />
              </div>

              {m.finalizados > 0 && (
                <p className="mt-1 text-[11px] text-gray-400">
                  {m.finalizados} {m.finalizados === 1 ? 'trabajo' : 'trabajos'} · ticket {formatCurrency(m.ticket)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-400">
        El mes en curso siempre se ve más bajo porque aún no termina. Compáralo
        con el mismo día del mes anterior, no con su total.
      </p>
    </div>
  )
}
