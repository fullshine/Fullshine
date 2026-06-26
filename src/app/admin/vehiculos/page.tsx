import { createAdminClient } from '@/lib/supabase/server'
import { getVehicleTypeLabel, formatDate } from '@/lib/utils'

export const metadata = { title: 'Vehículos | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function VehiculosPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createAdminClient()
  let query = supabase
    .from('vehicles')
    .select('*, customer:customers(full_name, phone)')
    .order('created_at', { ascending: false })

  const { data: vehicles } = await query

  let filtered = vehicles ?? []
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase()
    filtered = filtered.filter(v =>
      v.make?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.license_plate?.toLowerCase().includes(q) ||
      v.customer?.full_name?.toLowerCase().includes(q)
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
        <span className="text-gray-500 text-sm">{filtered.length} vehículos</span>
      </div>

      <form method="GET">
        <input name="q" className="input-field max-w-sm" placeholder="Buscar por marca, modelo o patente..."
          defaultValue={searchParams.q} />
      </form>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Vehículo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Patente</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Propietario</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {(v as any).brand ?? v.make} {v.model} {v.year}
                  {v.color && <span className="text-gray-400 font-normal"> · {v.color}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{(v as any).plate ?? v.license_plate ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{getVehicleTypeLabel(v.vehicle_type)}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-900">{v.customer?.full_name}</div>
                  <div className="text-gray-400 text-xs">{v.customer?.phone}</div>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(v.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron vehículos.</p>
        )}
      </div>
    </div>
  )
}
