import { getAllBookings } from '@/actions/admin'
import KanbanBoard from '@/components/admin/KanbanBoard'

export const metadata = { title: 'CRM Kanban | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const result = await getAllBookings()
  const bookings = result.data ?? []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM · Pipeline de clientes</h1>
        <p className="text-gray-500 text-sm mt-1">Mueve cada reserva entre etapas. El link de pago y la reseña se envían automáticamente por WhatsApp.</p>
      </div>
      <KanbanBoard initialBookings={bookings} />
    </div>
  )
}
