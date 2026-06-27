import { getDashboardStats, getBookings, getRecentBookings } from '@/actions/admin'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

export const metadata = { title: 'Dashboard | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [statsResult, bookingsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getBookings({ date: new Date().toISOString().split('T')[0] }),
    getRecentBookings(),
  ])

  const stats = statsResult.data
  const todayBookings = bookingsResult.data ?? []
  const recentBookings = recentResult.data ?? []

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Reservas hoy" value={stats.bookings_today} />
          <StatCard label="Esta semana" value={stats.bookings_week} />
          <StatCard label="Pendientes" value={stats.pending_bookings} highlight />
          <StatCard label="Ingresos del mes" value={formatCurrency(stats.revenue_month)} />
        </div>
      )}

      {/* Nuevas reservas (últimas 24h) */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Nuevas reservas
            <span className="text-sm font-normal text-gray-500">(últimas 24 horas)</span>
          </h2>
          <div className="space-y-2">
            {recentBookings.map(booking => {
              const createdAt = new Date(booking.created_at)
              const timeAgo = formatTimeAgo(createdAt)
              return (
                <div key={booking.id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                      {booking.customer?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customer?.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.service?.name} · {booking.vehicle?.make} {booking.vehicle?.model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agenda de hoy */}
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

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${Math.floor(diffHours / 24)} días`
}
