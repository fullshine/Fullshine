'use client'

import { useState, useTransition } from 'react'
import { addExpense, deleteExpense } from '@/actions/expenses'
import type { Expense, ExpenseCategory } from '@/types'

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'ayudante',    label: 'Ayudante',    emoji: '👷' },
  { value: 'insumos',     label: 'Insumos',     emoji: '🧴' },
  { value: 'herramientas',label: 'Herramientas',emoji: '🔧' },
  { value: 'otros',       label: 'Otros',       emoji: '📦' },
]

function fmtCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function getCatInfo(cat: ExpenseCategory) {
  return CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[3]
}

export default function ExpensesPanel({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    category: 'insumos' as ExpenseCategory,
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  })

  const totalGastos = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseInt(form.amount.replace(/\D/g, ''))
    if (!amount || amount <= 0) { setMsg('Ingresa un monto válido'); return }

    startTransition(async () => {
      const res = await addExpense({
        category: form.category,
        description: form.description.trim(),
        amount,
        expense_date: form.expense_date,
      })
      if (!res.success) { setMsg(res.error ?? 'Error'); return }
      setExpenses(prev => [{
        id: crypto.randomUUID(),
        category: form.category,
        description: form.description.trim() || null,
        amount,
        expense_date: form.expense_date,
        created_at: new Date().toISOString(),
      }, ...prev])
      setForm(f => ({ ...f, description: '', amount: '' }))
      setOpen(false)
      setMsg(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteExpense(id)
      if (res.success) setExpenses(prev => prev.filter(e => e.id !== id))
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">Gastos del mes</p>
          <p className="text-xs text-gray-400">Total: <span className="font-bold text-red-600">{fmtCLP(totalGastos)}</span></p>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 font-medium"
        >
          + Agregar gasto
        </button>
      </div>

      {/* Formulario */}
      {open && (
        <form onSubmit={handleSubmit} className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción (opcional)</label>
            <input
              type="text"
              placeholder="ej: Detergent Nanolex, pago ayudante sábado..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monto (CLP)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="ej: 25000"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              required
            />
          </div>
          {msg && <p className="text-xs text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending}
              className="flex-1 text-sm py-1.5 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-50">
              {pending ? 'Guardando...' : 'Guardar gasto'}
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Resumen por categoría */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {byCategory.map(c => (
          <div key={c.value} className="px-3 py-2 text-center">
            <p className="text-base">{c.emoji}</p>
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="text-xs font-bold text-gray-800">{c.total > 0 ? fmtCLP(c.total) : '—'}</p>
          </div>
        ))}
      </div>

      {/* Lista de gastos */}
      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 text-xs py-6">Sin gastos registrados este mes</p>
        ) : (
          expenses.map(exp => {
            const cat = getCatInfo(exp.category)
            return (
              <div key={exp.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {exp.description || cat.label}
                    </p>
                    <p className="text-xs text-gray-400">{exp.expense_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-red-600">-{fmtCLP(exp.amount)}</p>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={pending}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs disabled:opacity-20"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
