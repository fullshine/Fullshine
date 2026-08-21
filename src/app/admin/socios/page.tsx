import { getSocios, getDocumentos } from '@/actions/socios'
import SociosPanel from '@/components/admin/SociosPanel'

export const dynamic = 'force-dynamic'

export default async function AdminSociosPage({
  searchParams,
}: {
  searchParams?: { socio?: string }
}) {
  const { data: socios, error } = await getSocios() as {
    data: Awaited<ReturnType<typeof getSocios>>['data']
    error?: string
  }

  const activo = searchParams?.socio ?? socios[0]?.id ?? ''
  const docs = activo ? await getDocumentos(activo) : { data: [] }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Portal de socios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Facturas, informes y registro fotográfico que tus socios comerciales
          pueden descargar desde su acceso privado.
        </p>
      </header>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los socios: {error}
          <p className="mt-1 text-xs">
            ¿Ejecutaste <code>supabase/22_portal_socios.sql</code> en Supabase?
          </p>
        </div>
      )}

      {socios.length > 0 && (
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Accesos activos</p>
          <ul className="mt-2 space-y-1">
            {socios.map(s => (
              <li key={s.id} className="text-xs">
                <strong>{s.name}</strong> →{' '}
                <code className="bg-white px-1.5 py-0.5 rounded">
                  www.fullshine.autos/socios/{s.slug}
                </code>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-blue-700">
            El código de acceso se define en la tabla <code>partners</code> de Supabase.
          </p>
        </div>
      )}

      <SociosPanel socios={socios} documentos={docs.data} socioActivo={activo} />
    </div>
  )
}
