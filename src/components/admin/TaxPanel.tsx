'use client'

import { useState, useTransition } from 'react'
import { saveTaxPeriod } from '@/actions/tax'
import type { TaxPeriod } from '@/actions/tax'
import type { Expense } from '@/types'

const IVA_RATE = 0.19

function fmtCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function parseCLP(str: string): number {
  return parseInt(str.replace(/\D/g, '')) || 0
}

function CalcRow({ label, sub, value, color, bold, borderTop, negative }: {
  label: string; sub?: string; value: string
  color?: string; bold?: boolean; borderTop?: boolean; negative?: boolean
}) {
  return (
    <div className={`flex justify-between items-start py-2.5 ${borderTop ? 'border-t-2 border-gray-200 mt-1 pt-3' : 'border-b border-gray-50'}`}>
      <div>
        <p className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-bold tabular-nums ${color ?? 'text-gray-800'}`}>
        {negative ? '− ' : ''}{value}
      </p>
    </div>
  )
}

export default function TaxPanel({
  revenueMonth,
  expenses,
  initialPeriod,
  ivaFromRCV = 0,
}: {
  revenueMonth: number
  expenses: Expense[]
  initialPeriod: TaxPeriod
  ivaFromRCV?: number
}) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [ppmRate, setPpmRate]             = useState(initialPeriod.ppm_rate)
  const [preciosConIva, setPreciosConIva] = useState(initialPeriod.precios_con_iva)
  const [remanenteStr, setRemanenteStr]   = useState(
    initialPeriod.remanente > 0 ? initialPeriod.remanente.toString() : ''
  )
  const remanente = parseCLP(remanenteStr)

  // ── Cálculos ──────────────────────────────────────────────────────
  const ventasBrutas  = revenueMonth
  const ventasNetas   = preciosConIva
    ? Math.round(ventasBrutas / (1 + IVA_RATE))
    : ventasBrutas

  const ivaDebito = Math.round(ventasNetas * IVA_RATE)

  // IVA crédito: RCV del SII (preferente) o gastos manuales con factura
  const gastosFactura    = expenses.filter(e => e.has_factura).reduce((s, e) => s + e.amount, 0)
  const ivaCreditoGastos = Math.round(gastosFactura / (1 + IVA_RATE) * IVA_RATE)
  const ivaCreditoCompras = ivaFromRCV > 0 ? ivaFromRCV : ivaCreditoGastos

  // IVA crédito total: compras + remanente anterior
  const ivaCreditoTotal = ivaCreditoCompras + remanente
  const ivaNeto         = ivaDebito - ivaCreditoTotal

  // PPM
  const ppm = Math.round(ventasNetas * (ppmRate / 100))

  // F29
  const ivaAPagar       = Math.max(ivaNeto, 0)
  const remanenteNuevo  = ivaNeto < 0 ? Math.abs(ivaNeto) : 0
  const totalF29        = ivaAPagar + ppm

  const now = new Date()
  const mesDeclaracion = new Date(now.getFullYear(), now.getMonth() + 1, 12)
    .toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

  function handleSave() {
    startTransition(async () => {
      await saveTaxPeriod({
        month: initialPeriod.month,
        remanente,
        ppm_rate: ppmRate,
        precios_con_iva: preciosConIva,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-900 text-white">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Estimación F29</p>
          {ivaFromRCV > 0 && (
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
              ✓ RCV SII aplicado
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black text-amber-400">{fmtCLP(totalF29)}</p>
            <p className="text-xs text-gray-400 mt-1">Vence el {mesDeclaracion}</p>
          </div>
          {remanenteNuevo > 0 && (
            <div className="text-right">
              <p className="text-xs text-green-400 uppercase tracking-wide">Remanente próximo mes</p>
              <p className="text-lg font-bold text-green-400">{fmtCLP(remanenteNuevo)}</p>
            </div>
          )}
        </div>

        {/* Mini desglose siempre visible */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/10 flex-wrap">
          <div>
            <p className="text-xs text-gray-500">IVA Débito</p>
            <p className="text-sm font-bold text-orange-400">{fmtCLP(ivaDebito)}</p>
          </div>
          <div className="text-gray-600 self-center">−</div>
          <div>
            <p className="text-xs text-gray-500">
              IVA Crédito {ivaFromRCV > 0 ? '(RCV)' : '(gastos)'}
            </p>
            <p className="text-sm font-bold text-green-400">{fmtCLP(ivaCreditoTotal - remanente)}</p>
          </div>
          {remanente > 0 && (
            <>
              <div className="text-gray-600 self-center">−</div>
              <div>
                <p className="text-xs text-gray-500">Remanente</p>
                <p className="text-sm font-bold text-green-400">{fmtCLP(remanente)}</p>
              </div>
            </>
          )}
          <div className="text-gray-600 self-center">+</div>
          <div>
            <p className="text-xs text-gray-500">PPM ({ppmRate}%)</p>
            <p className="text-sm font-bold text-orange-400">{fmtCLP(ppm)}</p>
          </div>
          <div className="text-gray-600 self-center">=</div>
          <div>
            <p className="text-xs text-gray-500">Total F29</p>
            <p className="text-sm font-bold text-amber-400">{fmtCLP(totalF29)}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Configuración */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configuración</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Mis precios incluyen IVA</p>
              <p className="text-xs text-gray-400">Ej: cobro $119.000 y el IVA ya va incluido</p>
            </div>
            <button
              onClick={() => setPreciosConIva(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${preciosConIva ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${preciosConIva ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm font-medium text-gray-700">Tasa PPM</p>
              <p className="text-sm font-bold text-blue-600">{ppmRate}%</p>
            </div>
            <input
              type="range" min="0.25" max="5" step="0.25"
              value={ppmRate}
              onChange={e => setPpmRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0.25%</span><span>Pro Pyme: ~1%</span><span>5%</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Remanente mes anterior (Código 77 del F29)
            </label>
            <input
              type="text" inputMode="numeric"
              placeholder="$0 — ver tu último F29 declarado"
              value={remanenteStr}
              onChange={e => setRemanenteStr(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            />
          </div>

          {ivaFromRCV > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700">IVA Crédito desde RCV SII</p>
                <p className="text-xs text-green-600">Calculado del archivo CSV subido arriba</p>
              </div>
              <p className="text-lg font-black text-green-700">{fmtCLP(ivaFromRCV)}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
              📂 Sube el RCV de Compras del SII arriba para calcular el IVA crédito automáticamente
            </p>
          )}

          <button
            onClick={handleSave} disabled={pending}
            className="w-full text-sm py-2 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-50"
          >
            {saved ? '✅ Guardado' : pending ? 'Guardando...' : 'Guardar configuración del mes'}
          </button>
        </div>

        {/* Detalle cálculo */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detalle del cálculo</p>

          <CalcRow
            label="Ventas del mes"
            sub={preciosConIva ? 'Monto bruto ingresado (con IVA)' : 'Monto neto cobrado'}
            value={fmtCLP(ventasBrutas)}
          />
          {preciosConIva && (
            <CalcRow
              label="Base imponible neta"
              sub="Ventas ÷ 1.19"
              value={fmtCLP(ventasNetas)}
            />
          )}

          <div className="mt-3">
            <p className="text-xs font-semibold text-orange-600 uppercase mb-1">IVA Débito</p>
            <CalcRow
              label="IVA Débito (19%)"
              sub={`19% sobre ${fmtCLP(ventasNetas)}`}
              value={fmtCLP(ivaDebito)}
              color="text-orange-600"
            />
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">IVA Crédito</p>
            {ivaFromRCV > 0 ? (
              <CalcRow
                label="IVA Crédito RCV SII"
                sub="Calculado del archivo CSV oficial"
                value={fmtCLP(ivaFromRCV)}
                color="text-green-600"
                negative
              />
            ) : (
              <CalcRow
                label="Gastos con factura"
                sub={`${fmtCLP(gastosFactura)} registrados en sistema`}
                value={fmtCLP(ivaCreditoGastos)}
                color="text-green-600"
                negative
              />
            )}
            {remanente > 0 && (
              <CalcRow
                label="Remanente mes anterior"
                sub="Crédito arrastrado"
                value={fmtCLP(remanente)}
                color="text-green-600"
                negative
              />
            )}
          </div>

          <CalcRow
            label="IVA neto"
            value={ivaNeto >= 0 ? fmtCLP(ivaNeto) : `Crédito ${fmtCLP(Math.abs(ivaNeto))}`}
            color={ivaNeto >= 0 ? 'text-red-600' : 'text-green-600'}
            bold borderTop
          />

          <CalcRow
            label={`PPM (${ppmRate}%)`}
            sub={`${ppmRate}% sobre ${fmtCLP(ventasNetas)}`}
            value={fmtCLP(ppm)}
            color="text-orange-600"
          />

          <CalcRow
            label="Total F29 a declarar"
            value={fmtCLP(totalF29)}
            color="text-gray-900"
            bold borderTop
          />

          {remanenteNuevo > 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800">Remanente para el próximo mes</p>
                <p className="text-xs text-green-600">Tu crédito cubre el IVA — ingrésalo el mes siguiente</p>
              </div>
              <p className="text-xl font-black text-green-700">{fmtCLP(remanenteNuevo)}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center pt-1">
          ⚠️ Estimación referencial — confirma siempre con tu contador antes de declarar
        </p>
      </div>
    </div>
  )
}
