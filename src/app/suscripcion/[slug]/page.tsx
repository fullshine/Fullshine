import { notFound } from 'next/navigation'
import { getSuscripcionPorSlug, tieneAccesoSuscripcion, getPanelCliente } from '@/actions/suscripciones'
import AccesoSuscripcion from '@/components/suscripcion/AccesoSuscripcion'
import PanelSuscripcion from '@/components/suscripcion/PanelSuscripcion'

export const dynamic = 'force-dynamic'

// Página privada: no debe aparecer en Google ni en el sitemap.
export const metadata = {
  title: 'Mi plan | Fullshine Detailing',
  robots: { index: false, follow: false },
}

export default async function SuscripcionPage({ params }: { params: { slug: string } }) {
  const sub = await getSuscripcionPorSlug(params.slug)
  if (!sub) notFound()

  if (!(await tieneAccesoSuscripcion(params.slug))) {
    return <AccesoSuscripcion slug={params.slug} nombre={sub.nombre.split(' ')[0]} />
  }

  const r = await getPanelCliente(params.slug)
  if (!r.success || !r.data) {
    return <AccesoSuscripcion slug={params.slug} nombre={sub.nombre.split(' ')[0]} />
  }

  return (
    <PanelSuscripcion
      suscripcion={r.data.suscripcion}
      vehiculos={r.data.vehiculos}
      lavados={r.data.lavados}
      extras={r.data.extras}
      avance={r.data.avance}
    />
  )
}
