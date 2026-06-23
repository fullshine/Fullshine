import { getCustomers } from '@/actions/admin'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Clientes | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function ClientesPage({ searchParams }: { searchParams: { q?: string } }) {
  const result = await getCustomers(searchParams.q)
  const customers = result.data ?? []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <span className="text-gray-500 text-sm">{customers.length} clientes</span>
      </div>

      <form method="GET">
        <input name="q" className="input-field max-w-sm" placeholder="Buscar por nombre..."
          defaultValue={searchParams.q} />
      </form>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Teléfono</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-gray-500">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron clientes.</p>
        )}
      </div>
    </div>
  )
}
