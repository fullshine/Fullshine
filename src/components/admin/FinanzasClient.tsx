'use client'

import { useState } from 'react'
import ExpensesPanel from './ExpensesPanel'
import RCVImport from './RCVImport'
import TaxPanel from './TaxPanel'
import type { Expense } from '@/types'
import type { TaxPeriod } from '@/actions/tax'

export default function FinanzasClient({
  revenueMonth,
  initialExpenses,
  initialPeriod,
}: {
  revenueMonth: number
  initialExpenses: Expense[]
  initialPeriod: TaxPeriod
}) {
  const [ivaFromRCV, setIvaFromRCV] = useState(0)

  return (
    <>
      <ExpensesPanel initialExpenses={initialExpenses} />
      <RCVImport onIVAChange={setIvaFromRCV} />
      <TaxPanel
        revenueMonth={revenueMonth}
        expenses={initialExpenses}
        initialPeriod={initialPeriod}
        ivaFromRCV={ivaFromRCV}
      />
    </>
  )
}
