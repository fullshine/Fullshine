'use client'

import { useState, useTransition } from 'react'
import { moveBookingStage, sendReviewRequest, resendConfirmation } from '@/actions/admin'
import { generateCertificate } from '@/actions/certificates'
import { getStatusLabelFull, getStatusColorFull, formatCurrency } from '@/lib/utils'
import type { BookingWithRelations } from '@/types'
import ManualBookingModal from './ManualBookingModal'
import EditarReservaModal from './EditarReservaModal'
import HistoricoModal from './HistoricoModal'

const COLUMNS = [
  { id: 'pending',          label: 'Nueva reserva',   color: 'border-yellow-400' },
  { id: 'payment_received', label: 'Pago recibido',   color: 'border-teal-400'   },
  { id: 'confirmed',        label: 'Confirmada',      color: 'border-blue-400'   },
  { id: 'completed',        label: 'Completada',      color: 'border-green-400'  },
  { id: 'review_sent',      label: 'Resena enviada',  color: 'border-emerald-400'},
]

const NEXT_STAGE: Record<string, string> = {
  pending:          'payment_received',
  payment_received: 'confirmed',
  confirmed:        'completed',
  completed:        'review_sent',
}

const PREV_STAGE: Record<string, string> = {
  payment_received: 'pending',
  confirmed:        'payment_received',
  completed:        'confirmed',
  review_sent:      'completed',
}

/**
 * 'in_progress' ya no tiene columna propia. Las reservas que quedaron en ese
 * estado se muestran junto a las confirmadas para que ninguna desaparezca del
 * tablero; al avanzarlas pasan directo a 'completed'.
 */
const COLUMNA_DE: Record<string, string> = { in_progress: 'confirmed' }

function BookingCard({ booking, onAction, onEdit }: {
  booking: BookingWithRelations
  onAction: () => void
  onEdit: (id: string) => void
}) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const status = booking.status

  const b = booking as any
  // La tabla real usa booking_date (date) + slot_start (time), no scheduled_at.
  // Antes se leía la hora con substring sobre la fecha y salía siempre "-".
  const date = (b.booking_date ?? b.scheduled_at ?? '').substring(0, 10) || '-'
  const time = (b.slot_start ?? b.scheduled_at?.substring(11) ?? '').substring(0, 5) || '-'
  // vehicles usa brand/plate en la base real; make queda como respaldo.
  const vehicle = `${b.vehicle?.brand ?? b.vehicle?.make ?? ''} ${b.vehicle?.model ?? ''}`.trim()
  const total = b.total_price_clp ?? b.total_price ?? 0
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
          const certRes: any = await generateCertificate(booking.id)
          if (!certRes.success) {
            // Antes este error se tragaba en silencio y parecía que no pasaba nada.
            setMsg(`⚠️ Certificado no generado: ${certRes.error}`)
          } else if (certRes.skipped) {
            setMsg(null)
          } else if (certRes.already_existed) {
            setMsg(`ℹ️ Ya existía el certificado ${certRes.code}`)
          } else {
            setMsg(`✅ Certificado ${certRes.code} generado y enviado por WhatsApp`)
          }
        } else {
          setMsg(null)
        }
      }
      onAction()
    })
  }

  // Las reservas heredadas en 'in_progress' se comportan como confirmadas.
  const etapa = COLUMNA_DE[status] ?? status
  const nextStage = NEXT_STAGE[etapa]
  const prevStage = PREV_STAGE[etapa]
  const isCeramico = (booking.service as any)?.category === 'ceramico' ||
    booking.service?.name?.toLowerCase().includes('cerámico') ||
    booking.service?.name?.toLowerCase().includes('ceramico')
  const showCertBtn = (status === 'completed' || status === 'review_sent') && isCeramico

  function handleCertificate() {
    startTransition(async () => {
      setMsg('Generando certificado...')
      const res: any = await generateCertificate(booking.id)
      if (!res.success) { setMsg(`⚠️ ${res.error}`); return }
      if (res.skipped) {
        setMsg('No aplica (servicio no cerámico)')
      } else if (res.already_existed) {
        setMsg(`✅ Certificado ${res.code} reenviado por WhatsApp`)
      } else {
        setMsg(`✅ Certificado ${res.code} enviado por WhatsApp`)
      }
    })
  }

  function handleResend() {
    startTransition(async () => {
      setMsg('Reenviando confirmación...')
      const res = await resendConfirmation(booking.id)
      setMsg(res.success ? '✅ Confirmación reenviada por WhatsApp' : `Error: ${res.error}`)
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm text-sm ${pending ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-1 gap-1">
        <p className="font-semibold text-gray-900 leading-tight">
          {booking.customer?.full_name}
          {(booking as { notificaciones_activas?: boolean }).notificaciones_activas === false && (
            <span className="ml-1.5 text-gray-400 font-normal" title="Avisos automáticos desactivados">🔕</span>
          )}
        </p>
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
              nextStage === 'review_sent' ? 'bg-emerald-500 hover:bg-emerald-600' :
              'bg-blue-500 hover:bg-blue-600'
            }`}>
            {nextStage === 'review_sent' ? 'Pedir resena' :
             `-> ${COLUMNS.find(c => c.id === nextStage)?.label ?? nextStage}`}
          </button>
        )}
        {showCertBtn && (
          <button onClick={handleCertificate} disabled={pending}
            className="text-xs px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 disabled:opacity-50">
            🏅 Certificado
          </button>
        )}
        <button onClick={handleResend} disabled={pending}
          className="text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 disabled:opacity-50"
          title="Reenviar la confirmación por WhatsApp al cliente y push al negocio">
          🔁 Reenviar
        </button>
        <button onClick={() => onEdit(booking.id)} disabled={pending}
          className="text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 disabled:opacity-50"
          title="Editar fecha, hora, servicio o precio">
          ✏️ Editar
        </button>
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
  const [editando, setEditando] = useState<string | null>(null)
  const [showHistorico, setShowHistorico] = useState(false)

  function refresh() {
    window.location.reload()
  }

  const byStatus = (columna: string) =>
    bookings.filter(b => (COLUMNA_DE[b.status] ?? b.status) === columna)

  return (
    <>
      <ManualBookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={refresh}
      />
      <EditarReservaModal
        bookingId={editando}
        onClose={() => setEditando(null)}
        onSuccess={refresh}
      />
      <HistoricoModal
        open={showHistorico}
        onClose={() => setShowHistorico(false)}
        onSuccess={() => {}}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowHistorico(true)}
          className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-sm font-semibold hover:bg-purple-100 transition-colors"
        >
          📚 Cargar trabajos históricos
        </button>
        <span className="text-xs text-gray-500">
          Clientes atendidos antes de este sistema. No se les envía ningún mensaje.
        </span>
      </div>

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
                  <BookingCard key={b.id} booking={b} onAction={refresh} onEdit={setEditando} />
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
