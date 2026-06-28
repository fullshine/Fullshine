'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCustomer, deleteCustomer } from '@/actions/admin'
import type { Customer } from '@/types'

export default function ClienteActions({ customer }: { customer: Customer }) {
  const router = useRouter()
  const [mode, setMode] = useState<null | 'edit' | 'confirm-delete'>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(customer.full_name)
  const [phone, setPhone] = useState(customer.phone)
  const [email, setEmail] = useState(customer.email ?? '')

  async function handleSave() {
    setLoading(true)
    setError(null)
    const res = await updateCustomer(customer.id, { full_name: name, phone, email: email || undefined })
    setLoading(false)
    if (!res.success) { setError(res.error ?? 'Error al guardar'); return }
    setMode(null)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const res = await deleteCustomer(customer.id)
    setLoading(false)
    if (!res.success) { setError(res.error ?? 'Error al eliminar'); return }
    setMode(null)
    router.refresh()
  }

  if (mode === 'edit') {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3" colSpan={5}>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-gray-500">Nombre</label>
              <input className="block border border-gray-300 rounded px-2 py-1 text-sm w-48" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Teléfono</label>
              <input className="block border border-gray-300 rounded px-2 py-1 text-sm w-36" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input className="block border border-gray-300 rounded px-2 py-1 text-sm w-48" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => { setMode(null); setError(null) }} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
              Cancelar
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </td>
      </tr>
    )
  }

  if (mode === 'confirm-delete') {
    return (
      <tr className="bg-red-50">
        <td className="px-4 py-3" colSpan={5}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-red-700">¿Eliminar a <strong>{customer.full_name}</strong>? Se eliminarán también sus vehículos y reservas.</span>
            <button onClick={handleDelete} disabled={loading} className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button onClick={() => { setMode(null); setError(null) }} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
              Cancelar
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <td className="px-4 py-3 text-right">
      <button onClick={() => setMode('edit')} className="text-blue-600 hover:underline text-xs mr-3">Editar</button>
      <button onClick={() => setMode('confirm-delete')} className="text-red-500 hover:underline text-xs">Eliminar</button>
    </td>
  )
}
