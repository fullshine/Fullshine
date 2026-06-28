import { getBookings } from '@/actions/admin'
import BookingStatusUpdater from '@/components/admin/BookingStatusUpdater'
import { formatCurrency, formatDate, formatTime, getStatusColor, getStatusLabel, getVehicleTypeLabel } from '@/lib/utils'
import AgendaDatePicker from '@/components/admin/AgendaDatePicker'

export const metadata = { title: 'Agenda | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string; status?: string } }) {
  const date = searchParams.date ?? new Date().toISOString().split('T')[0]
  const result = await getBookings({ date, status: searchParams.status as any })
  const bookings = result.data ?? []

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Agenda</h1>
        <AgendaDatePicker defaultDate={date} />
      </div>

      <p className="text-gray-500 text-sm">{formatDate(date + 'T12:00:00')} — {bookings.length} reservas</p>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          No hay reservas para esta fecha.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Header: hora + estado */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{formatTime((booking as any).slot_start)}</span>
                  <span className="text-xs text-gray-400">→ {formatTime((booking as any).slot_end)}</span>
                </div>
                <span className={`badge ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              {/* Info cliente */}
              <p className="font-semibold text-gray-900">{booking.customer?.full_name}</p>
              <p className="text-sm text-gray-500">📱 {booking.customer?.phone}</p>

              {/* Vehículo y servicio */}
              <div className="mt-2 space-y-0.5">
                <p className="text-sm text-gray-600">
                  🚗 {(booking.vehicle as any)?.brand ?? booking.vehicle?.make} {booking.vehicle?.model}
                  {(booking.vehicle as any)?.plate ? ` · ${(booking.vehicle as any).plate}` : ''}
                </p>
                <p className="text-sm text-gray-600">✨ {booking.service?.name}</p>
                {(booking as any).customer_notes && (
                  <p className="text-sm text-gray-400 italic">"{(booking as any).customer_notes}"</p>
                )}
              </div>

              {/* Footer: precio + acciones */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-bold text-gray-900">{formatCurrency((booking as any).total_price_clp)}</p>
                <BookingStatusUpdater bookingId={booking.id} currentStatus={booking.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
