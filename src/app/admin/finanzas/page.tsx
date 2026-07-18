import { getDashboardStats } from '@/actions/admin'
import { getExpensesMonth } from '@/actions/expenses'
import { getTaxPeriod } from '@/actions/tax'
import { formatCurrency } from '@/lib/utils'
import ExpensesPanel from '@/components/admin/ExpensesPanel'
import TaxPanel from '@/components/admin/TaxPanel'

export const metadata = { title: 'Finanzas | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function FinanzasPage() {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  const [statsResult, expensesResult, taxPeriodResult] = await Promise.all([
    getDashboardStats(),
    getExpensesMonth(),
    getTaxPeriod(currentMonth),
  ])

  const stats    = statsResult.data
  const expenses = expensesResult.data ?? []
  const taxPeriod = taxPeriodResult.data!

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit     = (stats?.revenue_month ?? 0) - totalExpenses

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-400 capitalize">{monthLabel}</p>
      </div>

      {/* Resumen del mes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Ventas brutas</p>
          <p className="text-xl font-black text-gray-900">{formatCurrency(stats?.revenue_month ?? 0)}</p>
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

      {/* Panel de gastos */}
      <ExpensesPanel initialExpenses={expenses} />

      {/* Estimación F29 */}
      <TaxPanel
        revenueMonth={stats?.revenue_month ?? 0}
        expenses={expenses}
        initialPeriod={taxPeriod}
      />
    </div>
  )
}
