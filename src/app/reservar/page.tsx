import { Suspense } from 'react'
import { getServices } from '@/actions/bookings'
import BookingForm from '@/components/booking/BookingForm'

export const metadata = {
  title: 'Reservar Servicio | Fullshine Detailing',
  description: 'Reserva tu servicio de detailing en San Pedro de la Paz.',
}

export default async function ReservarPage() {
  const servicesResult = await getServices()
  const services = servicesResult.data ?? []

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Fullshine</span>
          </div>
          <span className="text-gray-400 text-sm">San Pedro de la Paz</span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reserva tu detailing</h1>
          <p className="text-gray-400">Profesional, rápido y sin complicaciones</p>
        </div>

        <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
          <BookingForm services={services} />
        </Suspense>
      </div>
    </main>
  )
}
