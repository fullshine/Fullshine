import { getDashboardStats, getBookings, getRecentBookings } from '@/actions/admin'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'
import PushSubscribeButton from '@/components/admin/PushSubscribe'

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
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
      <PushSubscribeButton />
    </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Reservas hoy" value={stats.bookings_today} />
          <StatCard label="Esta semana" value={stats.bookings_week} />
          <StatCard label="Pendientes" value={stats.pending_bookings} highlight />
          <StatCard label="Ingresos mes" value={formatCurrency(stats.revenue_month)} />
        </div>
      )}

      {/* Nuevas reservas (últimas 24h) */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Nuevas reservas
            <span className="text-xs font-normal text-gray-400">(24h)</span>
          </h2>
          <div className="space-y-2">
            {recentBookings.map(booking => {
              const timeAgo = formatTimeAgo(new Date(booking.created_at))
              return (
                <div key={booking.id} className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                      {booking.customer?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{booking.customer?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{booking.service?.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agenda de hoy */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          Hoy · {todayBookings.length} reservas
        </h2>
        {todayBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            Sin reservas hoy.
          </div>
        ) : (
          <div className="space-y-2">
            {todayBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{booking.customer?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{booking.service?.name}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(booking.status)}`}>
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
    <div className={`rounded-xl border p-4 ${highlight ? 'border-yellow-200 bg-yellow-50' : 'bg-white border-gray-200'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
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
  return `Hace ${Math.floor(diffHours / 24)}d`
}
