'use client'

import { useState } from 'react'
import type { Expense } from '@/types'

const IVA_RATE = 0.19

function fmtCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function Row({ label, value, sub, color, bold, borderTop }: {
  label: string
  sub?: string
  value: string
  color?: string
  bold?: boolean
  borderTop?: boolean
}) {
  return (
    <div className={`flex justify-between items-start py-2 ${borderTop ? 'border-t border-gray-100 mt-1' : ''}`}>
      <div>
        <p className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <p className={`text-sm font-bold ${color ?? 'text-gray-800'} tabular-nums`}>{value}</p>
    </div>
  )
}

export default function TaxPanel({
  revenueMonth,
  expenses,
}: {
  revenueMonth: number
  expenses: Expense[]
}) {
  const [ppmRate, setPpmRate] = useState(1.0)
  const [preciosConIva, setPreciosConIva] = useState(false)
  const [open, setOpen] = useState(false)

  const now = new Date()
  const monthName = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  // Base de cálculo
  const ventasBrutas = revenueMonth
  const ventasNetas = preciosConIva
    ? Math.round(ventasBrutas / (1 + IVA_RATE))
    : ventasBrutas

  // IVA Débito (lo que cobras al cliente)
  const ivaDebito = Math.round(ventasNetas * IVA_RATE)

  // IVA Crédito (gastos con factura)
  const gastosConFactura = expenses.filter(e => e.has_factura).reduce((s, e) => s + e.amount, 0)
  const ivaCredito = Math.round(gastosConFactura / (1 + IVA_RATE) * IVA_RATE)

  // IVA a pagar
  const ivaNeto = ivaDebito - ivaCredito

  // PPM
  const ppm = Math.round(ventasNetas * (ppmRate / 100))

  // Total F29
  const totalF29 = (ivaNeto > 0 ? ivaNeto : 0) + ppm

  const mesDeclaracion = new Date(now.getFullYear(), now.getMonth() + 1, 12)
    .toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">Estimación F29</p>
          <p className="text-xs text-gray-400 capitalize">{monthName} · vence 12 del próximo mes</p>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          ⚙ Config
        </button>
      </div>

      {/* Configuración */}
      {open && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700">Mis precios incluyen IVA</p>
              <p className="text-xs text-gray-400">Si cobras $119.000 y el IVA ya está incluido</p>
            </div>
            <button
              onClick={() => setPreciosConIva(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors ${preciosConIva ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full mx-auto transition-transform ${preciosConIva ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Tasa PPM: <span className="text-blue-600 font-bold">{ppmRate}%</span>
            </label>
            <input
              type="range" min="0.25" max="5" step="0.25"
              value={ppmRate}
              onChange={e => setPpmRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0.25%</span><span>Pro Pyme típico: 1%</span><span>5%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            ⚠️ Esta es una estimación referencial. Consulta con tu contador para tu declaración oficial.
          </p>
        </div>
      )}

      {/* Cálculo */}
      <div className="px-4 py-2 divide-y divide-gray-50">
        <Row
          label="Ventas del mes"
          sub={preciosConIva ? 'Monto bruto (con IVA incluido)' : 'Monto neto (sin IVA)'}
          value={fmtCLP(ventasBrutas)}
        />
        <Row
          label="Base imponible"
          sub="Ventas netas sin IVA"
          value={fmtCLP(ventasNetas)}
        />

        <div className="py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">IVA</p>
          <Row
            label="IVA Débito"
            sub={`19% sobre ${fmtCLP(ventasNetas)}`}
            value={fmtCLP(ivaDebito)}
            color="text-orange-600"
          />
          <Row
            label="IVA Crédito"
            sub={`Gastos con factura: ${fmtCLP(gastosConFactura)}`}
            value={`- ${fmtCLP(ivaCredito)}`}
            color="text-green-600"
          />
          <Row
            label="IVA neto a pagar"
            value={ivaNeto >= 0 ? fmtCLP(ivaNeto) : `Crédito: ${fmtCLP(Math.abs(ivaNeto))}`}
            color={ivaNeto >= 0 ? 'text-red-600' : 'text-green-600'}
            bold
            borderTop
          />
        </div>

        <div className="py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">PPM</p>
          <Row
            label={`PPM (${ppmRate}%)`}
            sub={`${ppmRate}% sobre ventas netas`}
            value={fmtCLP(ppm)}
            color="text-orange-600"
          />
        </div>
      </div>

      {/* Total */}
      <div className="mx-4 mb-4 bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Total a declarar en F29</p>
          <p className="text-xs text-gray-500">Vence el {mesDeclaracion}</p>
        </div>
        <p className="text-2xl font-black text-amber-400">{fmtCLP(totalF29)}</p>
      </div>

      {gastosConFactura === 0 && (
        <p className="text-xs text-gray-400 text-center pb-3 px-4">
          💡 Marca tus gastos con "factura" para descontar IVA crédito y reducir el pago
        </p>
      )}
    </div>
  )
}
