import Link from 'next/link'
import { getReservasConvenio } from '@/actions/certificado-socio'
import { fechaLarga } from '@/lib/certificado'

export const metadata = { title: 'Certificados | Fullshine Admin' }
export const dynamic = 'force-dynamic'

const ESTADO: Record<string, string> = {
  pending: 'Pendiente',
  payment_received: 'Pago recibido',
  confirmed: 'Confirmada',
  completed: 'Completada',
  review_sent: 'Reseña enviada',
}

export default async function CertificadosPage() {
  const r = await getReservasConvenio()
  const filas = r.data ?? []
  const sinPatente = filas.filter(f => !f.patente).length

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Certificados de preparación</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Un certificado por vehículo de convenio. Se genera, se guarda como PDF y se sube al portal del socio.
        </p>
      </div>

      {sinPatente > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">
            {sinPatente} {sinPatente === 1 ? 'vehículo no tiene' : 'vehículos no tienen'} patente registrada
          </p>
          <p>
            El portal del socio agrupa los informes por patente. Sin ella, el certificado se sube
            igual pero queda en un grupo donde nadie lo va a buscar. Complétalas en la ficha del
            vehículo antes de generar.
          </p>
        </div>
      )}

      {!r.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {r.error}
        </div>
      )}

      {filas.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 text-sm">
          No hay reservas de convenio todavía.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                  <th className="text-left font-medium px-4 py-2.5">Vehículo</th>
                  <th className="text-left font-medium px-4 py-2.5">Patente</th>
                  <th className="text-left font-medium px-4 py-2.5">Plan</th>
                  <th className="text-left font-medium px-4 py-2.5">Estado</th>
                  <th className="text-right font-medium px-4 py-2.5">Certificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filas.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                      {f.fecha ? fechaLarga(f.fecha) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900">{f.vehiculo || '—'}</td>
                    <td className="px-4 py-2.5">
                      {f.patente
                        ? <span className="font-mono font-semibold text-gray-900">{f.patente}</span>
                        : <span className="text-amber-600 text-xs">falta patente</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{f.plan}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{ESTADO[f.estado] ?? f.estado}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/certificado/${f.id}`} target="_blank"
                        className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100">
                        Generar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 leading-relaxed">
        <p className="font-semibold text-gray-900 mb-1">Cómo se usa</p>
        <p>
          Aprieta <strong>Generar</strong> y se abre el certificado en una pestaña nueva. Desde ahí,
          "Guardar como PDF". Después súbelo en <Link href="/admin/socios" className="text-brand-600 underline">Socios</Link>,
          con tipo <strong>Informe</strong> y la patente del vehículo.
        </p>
      </div>
    </div>
  )
}
