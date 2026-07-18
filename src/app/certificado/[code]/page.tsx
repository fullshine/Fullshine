import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getCertificate } from '@/actions/certificates'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default async function CertificatePage({ params }: { params: { code: string } }) {
  const cert = await getCertificate(params.code)
  if (!cert) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fullshine.autos'
  const certUrl = `${siteUrl}/certificado/${cert.certificate_code}`
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=E8960D&bgcolor=111827&data=${encodeURIComponent(certUrl)}`

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Encabezado */}
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Fullshine" width={64} height={64} className="mx-auto mb-3 rounded-full" />
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">Certificado de Garantía</p>
        </div>

        {/* Tarjeta del certificado */}
        <div className="relative bg-gray-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10">

          {/* Franja superior dorada */}
          <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Marca de agua */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
            <p className="text-white font-black text-8xl rotate-[-30deg] tracking-widest">FULLSHINE</p>
          </div>

          <div className="relative px-8 py-8 space-y-6">

            {/* Código */}
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">N° de certificado</p>
              <p className="text-amber-400 font-black text-2xl tracking-widest">{cert.certificate_code}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Cliente y vehículo */}
            <div className="space-y-3">
              <Row label="Cliente" value={cert.customer_name} />
              <Row label="Vehículo" value={`${cert.vehicle_brand} ${cert.vehicle_model}`} />
              {cert.vehicle_plate && <Row label="Patente" value={cert.vehicle_plate.toUpperCase()} />}
            </div>

            <div className="h-px bg-white/5" />

            {/* Servicio */}
            <div className="space-y-3">
              <Row label="Servicio aplicado" value={cert.service_name} highlight />
              <Row label="Producto" value={cert.product_name} />
              <Row label="Fecha de aplicación" value={formatDate(cert.applied_at)} />
              <Row label="Garantía" value={`${cert.warranty_years} años de protección Nasiol ZR53`} />
            </div>

            <div className="h-px bg-white/5" />

            {/* Vencimiento */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Garantía válida hasta</p>
              <p className="text-amber-400 font-black text-xl">{formatDate(cert.expires_at)}</p>
            </div>

            {/* Condiciones de garantía */}
            <div className="bg-gray-800/60 border border-white/5 rounded-2xl px-5 py-5 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Condiciones de garantía</p>
              <CondRow icon="🚿" text="Los lavados del vehículo deben realizarse en las instalaciones de Fullshine Detailing." />
              <CondRow icon="💎" text="Aplicación de Booster Cerámico Nasiol cada 6 meses para mantener la garantía vigente." />
              <CondRow icon="📋" text="La garantía puede ser revalidada en cada visita mediante registro en nuestro sistema." />
              <p className="text-gray-600 text-xs pt-1 border-t border-white/5">
                El incumplimiento de estas condiciones exime a Fullshine de responsabilidad sobre la garantía del producto.
              </p>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Certificado" width={140} height={140} className="rounded-xl" />
              <p className="text-gray-600 text-xs text-center">Escanea para verificar autenticidad</p>
            </div>

          </div>

          {/* Franja inferior */}
          <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Emitido por{' '}
          <span className="text-amber-500 font-semibold">FULLSHINE Detailing Premium</span>
          {' · '}Concepción, Chile
        </p>

      </div>
    </main>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-gray-500 text-sm shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

function CondRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <p className="text-gray-300 text-xs leading-relaxed">{text}</p>
    </div>
  )
}
