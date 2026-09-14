import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getServices } from '@/actions/bookings'
import BookingForm from '@/components/booking/BookingForm'
import PromoNoticeReserva from '@/components/PromoNoticeReserva'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Reservar Servicio | Fullshine Detailing',
  description: 'Reserva tu servicio de detailing en Concepción & San Pedro de la Paz.',
  robots: { index: false, follow: true },
}

export default async function ReservarPage({ searchParams }: { searchParams?: { servicio?: string; categoria?: string } }) {
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

        <PromoNoticeReserva />

        {services.length === 0 ? (
          /* getServices() no lanza excepción: si la base no responde devuelve
             una lista vacía. Sin este bloque el cliente veía un formulario sin
             servicios y se iba sin entender nada ni saber cómo contactarnos. */
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-lg font-semibold text-white">
              No pudimos cargar los servicios
            </h2>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Es un problema momentáneo de nuestro sistema, no de tu conexión.
              Escríbenos y te agendamos la hora al tiro, sin que tengas que
              esperar a que esto se arregle.
            </p>

            <a
              href="https://wa.me/56933654943?text=Hola%20Fullshine%2C%20quiero%20reservar%20una%20hora"
              className="block w-full mt-5 py-3 rounded-lg bg-green-500 text-white font-semibold"
            >
              Reservar por WhatsApp
            </a>
            <a
              href="tel:+56933654943"
              className="block w-full mt-2 py-3 rounded-lg border border-white/20 text-gray-200"
            >
              Llamar al +56 9 3365 4943
            </a>

            <p className="text-[11px] text-gray-500 mt-4">
              Camilo Henríquez 381, Concepción · Lun a Vie 09:00–18:00 · Sáb 09:00–14:00
            </p>
          </div>
        ) : (
          <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
            <BookingForm services={services} preselect={searchParams?.servicio} category={searchParams?.categoria} />
          </Suspense>
        )}
      </div>
    </main>
  )
}
