import { getServices } from '@/actions/bookings'
import { formatCurrency, getVehicleTypeLabel } from '@/lib/utils'

export const metadata = { title: 'Servicios | Fullshine Admin' }

export default async function ServiciosPage() {
  const result = await getServices()
  const services = result.data ?? []

  const vehicleTypes = ['hatch_sedan', 'suv_camioneta', 'pickup_xl']

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Servicio</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Cat.</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Duración</th>
              {vehicleTypes.map(vt => (
                <th key={vt} className="text-right px-3 py-3 font-semibold text-gray-700">
                  {getVehicleTypeLabel(vt)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div>{s.name}</div>
                  {s.description && <div className="text-xs text-gray-400">{s.description}</div>}
                </td>
                <td className="px-4 py-3 text-gray-500">{s.category}</td>
                <td className="px-4 py-3 text-gray-500">{(s as any).duration_hours ? `${(s as any).duration_hours}h` : '—'}</td>
                {vehicleTypes.map(vt => {
                  const price = (s.prices as any[]).find(p => p.vehicle_type === vt)?.price_clp
                  return (
                    <td key={vt} className="px-3 py-3 text-right text-gray-700">
                      {price ? formatCurrency(price) : '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
