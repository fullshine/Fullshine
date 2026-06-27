import { getDashboardStats, getBookings } from '@/actions/admin'
import { formatCurrency, getStatusColor, getStatusLabel, formatTime } from '@/lib/utils'

export const metadata = { title: 'Dashboard | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [statsResult, bookingsResult] = await Promise.all([
    getDashboardStats(),
    getBookings({ date: new Date().toISOString().split('T')[0] }),
  ])

  const stats = statsResult.data
  const todayBookings = bookingsResult.data ?? []

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Reservas hoy" value={stats.bookings_today} />
          <StatCard label="Esta semana" value={stats.bookings_week} />
          <StatCard label="Pendientes" value={stats.pending_bookings} highlight />
          <StatCard label="Ingresos del mes" value={formatCurrency(stats.revenue_month)} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Agenda de hoy ({todayBookings.length} reservas)
        </h2>
        {todayBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500 py-8">
            No hay reservas para hoy.
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{booking.customer?.full_name}</p>
                  <p className="text-sm text-gray-500">{booking.service?.name}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${highlight ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-yellow-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
