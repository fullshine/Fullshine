'use client'

import { COSTOS_FIJOS, META_AUTOS_SEMANA, estadoInsumos } from '@/lib/finanzas'
import type { PanelFinanzas } from '@/actions/finanzas'
import { cn, formatCurrency } from '@/lib/utils'

/**
 * Punto de equilibrio y avance semanal.
 *
 * La pregunta que responde es una sola: ¿cuántos autos faltan este mes para
 * no perder plata, y cuántos para además poder retirar?
 */
export default function EquilibrioPanel({ d }: { d: PanelFinanzas }) {
  const { mes, equilibrio: eq, bases, semanas } = d

  const semColor = estadoInsumos(mes.insumosPct)

  return (
    <div className="space-y-5">

      {/* ── Equilibrio ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Marcador
          titulo="Autos del mes"
          valor={String(mes.autos)}
          pie={`${formatCurrency(mes.ventas)} facturados`}
        />
        <Marcador
          titulo="Para cubrir costos"
          valor={eq.autosCubrirCostos === null ? '—' : String(eq.autosCubrirCostos)}
          pie={eq.faltanCostos === null ? 'Cada auto pierde plata'
            : eq.faltanCostos === 0 ? '✓ Costos cubiertos'
            : `Faltan ${eq.faltanCostos}`}
          tono={eq.faltanCostos === 0 ? 'bien' : 'alerta'}
        />
        <Marcador
          titulo="Para cubrir costos + retiro"
          valor={eq.autosConRetiro === null ? '—' : String(eq.autosConRetiro)}
          pie={eq.faltanRetiro === null ? '—'
            : eq.faltanRetiro === 0 ? `✓ Retiro de ${formatCurrency(eq.retiroObjetivo)} cubierto`
            : `Faltan ${eq.faltanRetiro}`}
          tono={eq.faltanRetiro === 0 ? 'bien' : 'neutro'}
        />
      </div>

      {!bases.confiable && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
          El mes lleva pocos autos, así que el promedio todavía no es representativo.
          Para el cálculo se está usando un ticket de referencia de {formatCurrency(bases.ticket)}
          {' '}y {formatCurrency(bases.insumoPorAuto)} de insumos por auto. Desde el quinto auto
          se empiezan a usar tus cifras reales.
        </p>
      )}

      {/* ── Costos fijos ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Costos fijos del mes</h3>
          <p className="font-bold text-gray-900">{formatCurrency(eq.fijos)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COSTOS_FIJOS.map(c => (
            <div key={c.nombre} className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{c.nombre}</span>
              <span className="font-medium text-gray-900">{formatCurrency(c.monto)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Se editan en el archivo <code>src/lib/finanzas.ts</code>. Si suben y no los actualizas,
          el punto de equilibrio queda optimista.
        </p>
      </div>

      {/* ── Semanas ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Semana a semana</h3>
          <p className="text-xs text-gray-500">Meta: {META_AUTOS_SEMANA} autos</p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="text-left font-medium py-2">Semana</th>
                <th className="text-right font-medium py-2">Autos</th>
                <th className="text-right font-medium py-2">Ventas</th>
                <th className="text-right font-medium py-2">Ticket</th>
                <th className="text-right font-medium py-2">Insumos</th>
                <th className="text-right font-medium py-2">Apartar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {semanas.map(s => (
                <tr key={s.numero} className={cn(s.enCurso && 'bg-brand-50/40')}>
                  <td className="py-2">
                    <span className="text-gray-900">{diaMes(s.desde)}–{diaMes(s.hasta)}</span>
                    {s.enCurso && <span className="ml-2 text-[10px] text-brand-600 font-medium">en curso</span>}
                  </td>
                  <td className="text-right py-2">
                    <span className={cn('font-semibold',
                      s.cumpleMeta ? 'text-green-600' : s.enCurso ? 'text-gray-400' : 'text-red-500')}>
                      {s.autos}
                    </span>
                  </td>
                  <td className="text-right py-2 text-gray-700">{s.ventas ? formatCurrency(s.ventas) : '—'}</td>
                  <td className="text-right py-2 text-gray-500">{s.ticket ? formatCurrency(s.ticket) : '—'}</td>
                  <td className="text-right py-2 text-gray-500">{s.insumos ? formatCurrency(s.insumos) : '—'}</td>
                  <td className="text-right py-2 text-amber-700">
                    {s.apartarImpuestos ? formatCurrency(s.apartarImpuestos) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-gray-400 mt-3">
          "Apartar" es el 12% de las ventas que conviene guardar para IVA y PPM.
          No es un gasto: es plata que ya no es tuya.
        </p>
      </div>

      {/* ── Insumos ── */}
      <div className={cn('rounded-xl border p-4',
        semColor === 'peligro' ? 'border-red-200 bg-red-50'
          : semColor === 'alerta' ? 'border-amber-200 bg-amber-50'
          : 'border-gray-200 bg-white')}>
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Insumos sobre ventas</h3>
          <p className={cn('font-bold',
            semColor === 'peligro' ? 'text-red-700'
              : semColor === 'alerta' ? 'text-amber-700' : 'text-green-700')}>
            {(mes.insumosPct * 100).toFixed(1)}%
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {formatCurrency(mes.insumos)} en insumos · {formatCurrency(mes.insumoPorAuto)} por auto
          {mes.insumos > 0 && ` · ${(mes.pctConFactura * 100).toFixed(0)}% con factura`}
        </p>
        {semColor !== 'bien' && (
          <p className="text-xs mt-2 leading-relaxed text-gray-700">
            {semColor === 'peligro'
              ? 'Estás gastando demasiado en insumos para lo que estás vendiendo. Revisa si hubo una compra grande que rinda varios meses, o si se está yendo más producto del necesario.'
              : 'El gasto en insumos va algo alto. Vale la pena mirarlo antes de que se vuelva costumbre.'}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-2">
          Sale de tus gastos con categoría "insumos". Anótalos en la pestaña Gastos.
        </p>
      </div>
    </div>
  )
}

function diaMes(iso: string) {
  return String(Number(iso.slice(8, 10)))
}

function Marcador({ titulo, valor, pie, tono = 'neutro' }: {
  titulo: string; valor: string; pie: string; tono?: 'bien' | 'alerta' | 'neutro'
}) {
  return (
    <div className={cn('rounded-xl border p-4',
      tono === 'bien' ? 'border-green-200 bg-green-50'
        : tono === 'alerta' ? 'border-amber-200 bg-amber-50'
        : 'border-gray-200 bg-white')}>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{titulo}</p>
      <p className="text-3xl font-black text-gray-900 mt-1 leading-none">{valor}</p>
      <p className="text-xs text-gray-500 mt-1.5">{pie}</p>
    </div>
  )
}
