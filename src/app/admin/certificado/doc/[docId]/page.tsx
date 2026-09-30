import { notFound } from 'next/navigation'
import { getCertificadoDeDocumento } from '@/actions/certificado-socio'
import HojaCertificado from '@/components/admin/HojaCertificado'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Certificado de preparación',
  robots: { index: false, follow: false },
}

/** Certificado generado desde una factura cargada en el portal del socio. */
export default async function CertificadoDocPage({ params }: { params: { docId: string } }) {
  const r = await getCertificadoDeDocumento(params.docId)

  if (!r.success) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {r.error}
        </p>
        <a href="/admin/socios" className="mt-4 inline-block text-sm text-brand-600 underline">
          Volver a Socios
        </a>
      </div>
    )
  }

  if (!r.data) notFound()
  return <HojaCertificado d={r.data} />
}
