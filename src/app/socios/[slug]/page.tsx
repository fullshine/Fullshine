import { Suspense } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServices } from '@/actions/bookings'
import { getSocio, tieneAcceso, getDocumentos, getHistorial } from '@/actions/socios'
import BookingForm from '@/components/booking/BookingForm'
import AccesoSocio from '@/components/socios/AccesoSocio'
import PortalSocio from '@/components/socios/PortalSocio'
import { BUSINESS } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * Portal privado de socios comerciales.
 *
 * Una sola página sirve a todos los socios: cada uno tiene su slug, su código
 * de acceso y su categoría de servicios con tarifas propias. Sumar una nueva
 * automotora es insertar una fila en `partners`, sin tocar código.
 */

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const socio = await getSocio(params.slug)
  return {
    title: socio ? `Portal de socios · ${socio.name}` : 'Portal de socios',
    description: 'Acceso privado para socios comerciales de Fullshine.',
    robots: { index: false, follow: false },
    manifest: `/manifest-${params.slug}.json`,
  }
}

export default async function PortalSocioPage({ params }: { params: { slug: string } }) {
  const socio = await getSocio(params.slug)
  if (!socio) return notFound()

  // Puerta de acceso: sin código válido no se carga ningún dato del socio.
  const autorizado = await tieneAcceso(params.slug)
  if (!autorizado) {
    return <AccesoSocio slug={socio.slug} nombre={socio.name} />
  }

  const [servicios, docs, hist] = await Promise.all([
    getServices(),
    getDocumentos(socio.id),
    getHistorial(socio.service_category),
  ])

  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-gray-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fullshine" width={40} height={40}
              className="rounded-full" priority />
            <div>
              <p className="text-sm font-bold leading-none tracking-wide text-white">FULLSHINE</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Detailing Premium</p>
            </div>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            {socio.name}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <PortalSocio
          slug={socio.slug}
          nombre={socio.name}
          historial={hist.data}
          documentos={docs.data}
        >
          {/* Pestaña "Agendar" */}
          <div>
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
              <p className="text-sm leading-relaxed text-blue-200/80">
                Indica la <strong className="text-blue-200">patente</strong> del
                vehículo al agendar: así queda registrada en el historial. Para más
                de 3 unidades en una semana, coordina con anticipación al{' '}
                <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2">
                  {BUSINESS.phoneDisplay}
                </a>.
              </p>
            </div>

            <Suspense fallback={<div className="text-center text-white">Cargando…</div>}>
              <BookingForm
                services={servicios.data ?? []}
                category={socio.service_category}
                hidePrices
                strict
              />
            </Suspense>
          </div>
        </PortalSocio>

        <footer className="mt-10 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-500">{BUSINESS.street}, {BUSINESS.city}</p>
          <p className="mt-1 text-xs text-gray-600">Lun a Vie 09:00–18:00 · Sáb 09:00–14:00</p>
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-amber-500 hover:text-amber-400">
            Escribir por WhatsApp
          </a>
        </footer>
      </div>
    </main>
  )
}
