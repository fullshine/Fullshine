import { notFound } from 'next/navigation'
import { getDatosCertificado } from '@/actions/certificado-socio'
import HojaCertificado from '@/components/admin/HojaCertificado'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Certificado de preparación',
  robots: { index: false, follow: false },
}

/** Certificado generado desde una reserva de convenio. */
export default async function CertificadoPage({ params }: { params: { bookingId: string } }) {
  const r = await getDatosCertificado(params.bookingId)
  if (!r.success || !r.data) notFound()
  return <HojaCertificado d={r.data} />
}
