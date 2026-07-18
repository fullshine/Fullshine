'use client'

import { useState, useTransition } from 'react'
import { moveBookingStage, sendReviewRequest } from '@/actions/admin'
import { generateCertificate } from '@/actions/certificates'
import { getStatusLabelFull, getStatusColorFull, formatCurrency } from '@/lib/utils'
import type { BookingWithRelations } from '@/types'
import ManualBookingModal from './ManualBookingModal'

const COLUMNS = [
  { id: 'pending',          label: 'Nueva reserva',   color: 'border-yellow-400' },
  { id: 'payment_received', label: 'Pago recibido',   color: 'border-teal-400'   },
  { id: 'confirmed',        label: 'Confirmada',      color: 'border-blue-400'   },
  { id: 'in_progress',      label: 'En trabajo',      color: 'border-purple-400' },
  { id: 'completed',        label: 'Completada',      color: 'border-green-400'  },
  { id: 'review_sent',      label: 'Resena enviada',  color: 'border-emerald-400'},
]

const NEXT_STAGE: Record<string, string> = {
  pending:          'payment_received',
  payment_received: 'confirmed',
  confirmed:        'in_progress',
  in_progress:      'completed',
  completed:        'review_sent',
}

const PREV_STAGE: Record<string, string> = {
  payment_received: 'pending',
  confirmed:        'payment_received',
  in_progress:      'confirmed',
  completed:        'in_progress',
  review_sent:      'completed',
}

function BookingCard({ booking, onAction }: { booking: BookingWithRelations; onAction: () => void }) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const status = booking.status

  const b = booking as any
  const scheduledAt = b.scheduled_at ?? b.booking_date ?? ''
  const date = scheduledAt.substring(0, 10) || '-'
  const time = scheduledAt.substring(11, 16) || '-'
  const vehicle = `${booking.vehicle?.make ?? ''} ${booking.vehicle?.model ?? ''}`.trim()
  const total = booking.total_price ?? 0
  const amount20 = Math.round(total * 0.2)

  function move(newStatus: string, isForward = true) {
    startTransition(async () => {
      if (newStatus === 'review_sent' && isForward) {
        setMsg('Enviando solicitud de resena...')
        const res = await sendReviewRequest(booking.id)
        if (!res.success) { setMsg(`Error: ${res.error}`); return }
        setMsg('Resena solicitada')
      } else {
        const res = await moveBookingStage(booking.id, newStatus)
        if (!res.success) { setMsg(`Error: ${res.error}`); return }

        // Generar certificado automáticamente al completar (solo cerámicos)
        if (newStatus === 'completed' && isForward) {
          setMsg('Generando certificado...')
          const certRes = await generateCertificate(booking.id)
          if (certRes.success && !certRes.skipped) {
            setMsg(`✅ Certificado ${certRes.code} generado y enviado por WhatsApp`)
          } else {
            setMsg(null)
          }
        } else {
          setMsg(null)
        }
      }
      onAction()
    })
  }

  const nextStage = NEXT_STAGE[status]
  const prevStage = PREV_STAGE[status]

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm text-sm ${pending ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-1 gap-1">
        <p className="font-semibold text-gray-900 leading-tight">{booking.customer?.full_name}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${getStatusColorFull(status)}`}>
          {getStatusLabelFull(status)}
        </span>
      </div>
      <p className="text-gray-600 text-xs">{booking.service?.name}</p>
      {vehicle && <p className="text-gray-400 text-xs">{vehicle}</p>}
      <p className="text-gray-400 text-xs mt-1">Fecha: {date} a las {time}h</p>
      {total > 0 && (
        <p className="text-gray-700 text-xs mt-1 font-medium">
          Total: {formatCurrency(total)}
          {status === 'pending' && (
            <span className="text-orange-600 ml-1">(anticipo: ${amount20.toLocaleString('es-CL')})</span>
          )}
        </p>
      )}
      {msg && <p className="text-xs mt-1 text-blue-600">{msg}</p>}
      <div className="flex gap-1 mt-2 flex-wrap">
        {prevStage && (
          <button onClick={() => move(prevStage, false)} disabled={pending}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50">
            Atras
          </button>
        )}
        {nextStage && (
          <button onClick={() => move(nextStage)} disabled={pending}
            className={`text-xs px-2 py-1 rounded text-white disabled:opacity-50 ${
              nextStage === 'review_sent'  ? 'bg-emerald-500 hover:bg-emerald-600' :
              'bg-blue-500 hover:bg-blue-600'
            }`}>
            {nextStage === 'review_sent'  ? 'Pedir resena' :
             `-> ${COLUMNS.find(c => c.id === nextStage)?.label ?? nextStage}`}
          </button>
        )}
        <button onClick={() => move('cancelled')} disabled={pending}
          className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 ml-auto">
          X
        </button>
      </div>
    </div>
  )
}

export default function KanbanBoard({ initialBookings }: { initialBookings: BookingWithRelations[] }) {
  const [bookings] = useState(initialBookings)
  const [showModal, setShowModal] = useState(false)

  function refresh() {
    window.location.reload()
  }

  const byStatus = (status: string) => bookings.filter(b => b.status === status)

  return (
    <>
      <ManualBookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refresh}
      />
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-60">
            <div className={`bg-gray-50 rounded-xl border-t-4 ${col.color} p-3 h-full`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-2 py-0.5">
                  {byStatus(col.id).length}
                </span>
              </div>
              {col.id === 'pending' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full mb-2 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-xs font-medium"
                >
                  + Nueva reserva
                </button>
              )}
              <div className="space-y-2">
                {byStatus(col.id).map(b => (
                  <BookingCard key={b.id} booking={b} onAction={refresh} />
                ))}
                {byStatus(col.id).length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-4">Sin reservas</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
