import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getServices } from '@/actions/bookings'
import BookingForm from '@/components/booking/BookingForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Reservar Servicio | Fullshine Detailing',
  description: 'Reserva tu servicio de detailing en Concepción & San Pedro de la Paz.',
}

export default async function ReservarPage() {
  const servicesResult = await getServices()
  const services = servicesResult.data ?? []

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Fullshine" width={40} height={40} className="rounded-full" />
            <div>
              <p className="font-bold text-white text-sm leading-none tracking-wide">FULLSHINE</p>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Detailing Premium</p>
            </div>
          </Link>
          <span className="text-gray-500 text-sm">📍 Concepción & San Pedro de la Paz</span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reserva tu detailing</h1>
          <p className="text-gray-500">Profesional, rápido y sin complicaciones</p>
        </div>

        <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
          <BookingForm services={services} />
        </Suspense>
      </div>
    </main>
  )
}
