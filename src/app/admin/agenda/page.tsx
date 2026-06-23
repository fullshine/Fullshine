import { getBookings } from '@/actions/admin'
import BookingStatusUpdater from '@/components/admin/BookingStatusUpdater'
import { formatCurrency, formatDate, formatTime, getStatusColor, getStatusLabel, getVehicleTypeLabel } from '@/lib/utils'

export const metadata = { title: 'Agenda | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; status?: string }
}) {
  const date = searchParams.date ?? new Date().toISOString().split('T')[0]
  const result = await getBookings({ date, status: searchParams.status as any })
  const bookings = result.data ?? []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <input type="date" defaultValue={date}
          onChange={e => { window.location.href = `/admin/agenda?date=${e.target.value}` }}
          className="input-field w-auto" />
      </div>

      <p className="text-gray-500 text-sm">{formatDate(date + 'T12:00:00')} — {bookings.length} reservas</p>

      {bookings.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">No hay reservas para esta fecha.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xl font-bold text-gray-900">{formatTime(booking.scheduled_at)}</p>
                    <p className="text-xs text-gray-400">→ {formatTime(booking.estimated_end_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-lg">{booking.customer?.full_name}</p>
                    <p className="text-sm text-gray-600">📱 {booking.customer?.phone}</p>
                    <p className="text-sm text-gray-600">
                      🚗 {booking.vehicle?.make} {booking.vehicle?.model} {booking.vehicle?.year}
                      {booking.vehicle?.license_plate && ` · ${booking.vehicle.license_plate}`}
                      {' · '}{getVehicleTypeLabel(booking.vehicle?.vehicle_type ?? '')}
                    </p>
                    <p className="text-sm text-gray-600">✨ {booking.service?.name}</p>
                    {booking.notes && <p className="text-sm text-gray-400 italic">"{booking.notes}"</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-900">{formatCurrency(booking.total_price)}</p>
                  <span className={`badge ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                  <BookingStatusUpdater bookingId={booking.id} currentStatus={booking.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
