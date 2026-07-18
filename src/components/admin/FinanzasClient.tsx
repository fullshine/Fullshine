'use client'

import { useState } from 'react'
import ExpensesPanel from './ExpensesPanel'
import RCVImport from './RCVImport'
import TaxPanel from './TaxPanel'
import { formatCurrency } from '@/lib/utils'
import type { Expense } from '@/types'
import type { TaxPeriod } from '@/actions/tax'

export default function FinanzasClient({
  revenueMonth,
  initialExpenses,
  initialPeriod,
  currentMonth,
}: {
  revenueMonth: number
  initialExpenses: Expense[]
  initialPeriod: TaxPeriod
  currentMonth: string
}) {
  // Estado único compartido por todos los paneles
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  // Inicializar desde DB (persiste entre navegaciones)
  const [ivaFromRCV, setIvaFromRCV] = useState(initialPeriod.iva_credito_rcv ?? 0)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit     = revenueMonth - totalExpenses

  function handleAdd(e: Expense) {
    setExpenses(prev => [e, ...prev])
  }

  function handleDelete(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      {/* Resumen del mes — reactivo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Ventas brutas</p>
          <p className="text-xl font-black text-gray-900">{formatCurrency(revenueMonth)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Gastos</p>
          <p className="text-xl font-black text-red-600">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-gray-500 mb-1">Utilidad neta</p>
          <p className={`text-xl font-black ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Panel de gastos — comparte estado con TaxPanel */}
      <ExpensesPanel
        expenses={expenses}
        onAdd={handleAdd}
        onDelete={handleDelete}
      />

      {/* RCV compras SII — su IVA fluye al TaxPanel y se persiste en DB */}
      <RCVImport
        onIVAChange={setIvaFromRCV}
        month={currentMonth}
        initialFileName={initialPeriod.rcv_filename}
      />

      {/* F29 — recibe gastos en vivo + IVA del RCV */}
      <TaxPanel
        revenueMonth={revenueMonth}
        expenses={expenses}
        initialPeriod={initialPeriod}
        ivaFromRCV={ivaFromRCV}
      />
    </>
  )
}
