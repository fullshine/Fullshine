import { getDashboardStats } from '@/actions/admin'
import { getExpensesMonth } from '@/actions/expenses'
import { getTaxPeriod } from '@/actions/tax'
import FinanzasClient from '@/components/admin/FinanzasClient'

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

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-400 capitalize">{monthLabel}</p>
      </div>

      <FinanzasClient
        revenueMonth={stats?.revenue_month ?? 0}
        initialExpenses={expenses}
        initialPeriod={taxPeriod}
      />
    </div>
  )
}
