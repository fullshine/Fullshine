'use client'

import { useState, useTransition } from 'react'
import ExpensesPanel from './ExpensesPanel'
import RCVImport from './RCVImport'
import TaxPanel from './TaxPanel'
import EquilibrioPanel from './EquilibrioPanel'
import CierreMensualPanel from './CierreMensualPanel'
import { getPanelFinanzas } from '@/actions/finanzas'
import type { PanelFinanzas } from '@/actions/finanzas'
import { cn, formatCurrency } from '@/lib/utils'
import type { Expense } from '@/types'
import type { TaxPeriod } from '@/actions/tax'

type Pestana = 'equilibrio' | 'gastos' | 'impuestos' | 'cierre'

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: 'equilibrio', label: 'Equilibrio' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'impuestos', label: 'Impuestos' },
  { id: 'cierre', label: 'Cierre del mes' },
]

export default function FinanzasClient({
  revenueMonth,
  initialExpenses,
  initialPeriod,
  currentMonth,
  initialPanel,
}: {
  revenueMonth: number
  initialExpenses: Expense[]
  initialPeriod: TaxPeriod
  currentMonth: string
  initialPanel: PanelFinanzas | null
}) {
  const [pestana, setPestana] = useState<Pestana>('equilibrio')

  // Estado compartido por los paneles de gastos e impuestos
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [ivaFromRCV, setIvaFromRCV] = useState(initialPeriod.iva_credito_rcv ?? 0)
  const [rcvTotal, setRcvTotal] = useState(initialPeriod.rcv_total ?? 0)

  const [panel, setPanel] = useState<PanelFinanzas | null>(initialPanel)
  const [, start] = useTransition()

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalGastos = totalExpenses + rcvTotal
  const netProfit = revenueMonth - totalGastos

  function recargarPanel() {
    start(async () => {
      const r = await getPanelFinanzas(currentMonth)
      if (r.success && r.data) setPanel(r.data)
    })
  }

  /** Un gasto nuevo de insumos cambia el punto de equilibrio, así que el
   *  panel de equilibrio tiene que recalcularse junto con la lista. */
  function handleAdd(e: Expense) {
    setExpenses(prev => [e, ...prev])
    if (e.category === 'insumos') recargarPanel()
  }

  function handleDelete(id: string) {
    const borrado = expenses.find(e => e.id === id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    if (borrado?.category === 'insumos') recargarPanel()
  }

  return (
    <>
      {/* Resumen del mes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Ventas brutas</p>
          <p className="text-xl font-black text-gray-900">{formatCurrency(revenueMonth)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Gastos totales</p>
          <p className="text-xl font-black text-red-600">-{formatCurrency(totalGastos)}</p>
          {rcvTotal > 0 && (
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-gray-400">Manual: -{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-400">RCV: -{formatCurrency(rcvTotal)}</p>
            </div>
          )}
        </div>
        <div className={`rounded-xl border p-4 ${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-gray-500 mb-1">Utilidad neta</p>
          <p className={`text-xl font-black ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {PESTANAS.map(p => (
          <button key={p.id} onClick={() => setPestana(p.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              pestana === p.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {pestana === 'equilibrio' && (
        panel
          ? <EquilibrioPanel d={panel} />
          : <AvisoMigracion />
      )}

      {pestana === 'gastos' && (
        <ExpensesPanel expenses={expenses} onAdd={handleAdd} onDelete={handleDelete} />
      )}

      {pestana === 'impuestos' && (
        <div className="space-y-5">
          <RCVImport
            onIVAChange={setIvaFromRCV}
            onTotalChange={setRcvTotal}
            month={currentMonth}
            initialFileName={initialPeriod.rcv_filename}
          />
          <TaxPanel
            revenueMonth={revenueMonth}
            expenses={expenses}
            initialPeriod={initialPeriod}
            ivaFromRCV={ivaFromRCV}
          />
        </div>
      )}

      {pestana === 'cierre' && (
        panel
          ? <CierreMensualPanel d={panel} onCambio={recargarPanel} />
          : <AvisoMigracion />
      )}
    </>
  )
}

function AvisoMigracion() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed">
      <p className="font-semibold mb-1">Falta ejecutar la migración</p>
      <p>
        Pega <code>supabase/28_cierres_mensuales.sql</code> en el SQL Editor de Supabase
        y recarga esta página. Las pestañas de Gastos e Impuestos funcionan igual mientras tanto.
      </p>
    </div>
  )
}
