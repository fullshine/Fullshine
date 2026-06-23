'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatus } from '@/actions/admin'
import type { BookingStatus } from '@/types'

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const LABELS: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmar',
  in_progress: 'Iniciar',
  completed: 'Completar',
  cancelled: 'Cancelar',
}

export default function BookingStatusUpdater({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: BookingStatus
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const transitions = TRANSITIONS[currentStatus] ?? []

  if (transitions.length === 0) return null

  async function handleUpdate(status: BookingStatus) {
    setLoading(true)
    await updateBookingStatus(bookingId, status)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-1 flex-wrap justify-end">
      {transitions.map(status => (
        <button key={status} disabled={loading}
          onClick={() => handleUpdate(status)}
          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors border disabled:opacity-50 ${
            status === 'cancelled'
              ? 'border-red-300 text-red-600 hover:bg-red-50'
              : 'border-brand-300 text-brand-700 hover:bg-brand-50'
          }`}>
          {LABELS[status]}
        </button>
      ))}
    </div>
  )
}
