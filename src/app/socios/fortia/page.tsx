import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getServices } from '@/actions/bookings'
import BookingForm from '@/components/booking/BookingForm'
import { BUSINESS, buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * Acceso privado de Automotora Fortia.
 *
 * No se indexa ni se enlaza desde ningún lugar del sitio: la URL se comparte
 * directamente con ellos. Los precios quedan ocultos porque la tarifa está
 * acordada por contrato y quien agenda suele ser un operario, no quien
 * negocia. Además evita que esos valores preferenciales circulen.
 */

const SOCIO = 'Automotora Fortia'

export const metadata = buildMetadata({
  title: `Agenda Fullshine — ${SOCIO}`,
  description: 'Acceso privado para agendar la preparación de vehículos.',
  path: '/socios/fortia',
  noindex: true,
})

const PLANES = [
  {
    n: 'Plan Pulido + Interior',
    d: 'Pulido abrillantador con descontaminación completa de carrocería, más acondicionamiento interior a fondo. Para unidades que entran a exhibición.',
    t: '1 día hábil',
  },
  {
    n: 'Plan Lavado Detallado',
    d: 'Terminación Full Supremo: lavado premium, cera sintética de hasta 6 meses, sellado de neumáticos e interior completo.',
    t: '4 a 5 horas',
  },
  {
    n: 'Plan Lavado para Entrega',
    d: 'Preparación final antes de entregar el vehículo al comprador. Snow Foam, encerado, hidratación y limpieza interior.',
    t: '2 horas',
  },
]

export default async function AccesoFortia() {
  const result = await getServices()
  const services = result.data ?? []

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Cabecera propia, sin menú del sitio público */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-gray-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fullshine" width={40} height={40} className="rounded-full" priority />
            <div>
              <p className="text-sm font-bold leading-none tracking-wide text-white">FULLSHINE</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Detailing Premium</p>
            </div>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            {SOCIO}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-black text-white">
            Agendar preparación de vehículo
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Acceso exclusivo para {SOCIO}. Las tarifas son las acordadas en el
            convenio vigente y se facturan semanalmente.
          </p>
        </div>

        {/* Recordatorio de los planes disponibles */}
        <div className="mb-10 space-y-3">
          {PLANES.map(p => (
            <div key={p.n} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-amber-400">{p.n}</h2>
                <span className="shrink-0 text-xs text-gray-500">⏱ {p.t}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{p.d}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
          <p className="text-sm leading-relaxed text-blue-200/80">
            <strong className="text-blue-200">Antes de agendar:</strong> indica la
            patente del vehículo en el campo correspondiente. Para más de 3 unidades
            en una misma semana, coordina con anticipación al{' '}
            <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2">
              {BUSINESS.phoneDisplay}
            </a>.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-white">Cargando…</div>}>
          <BookingForm services={services} category="automotora" hidePrices />
        </Suspense>

        <footer className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-500">
            {BUSINESS.street}, {BUSINESS.city}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Lun a Vie 09:00–18:00 · Sáb 09:00–14:00
          </p>
          <Link href={`https://wa.me/${BUSINESS.whatsapp}`}
            className="mt-4 inline-block text-sm font-medium text-amber-500 hover:text-amber-400">
            Escribir por WhatsApp
          </Link>
        </footer>
      </div>
    </main>
  )
}
