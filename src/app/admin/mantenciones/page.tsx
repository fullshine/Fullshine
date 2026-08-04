import { getMantenciones } from '@/actions/mantenciones'
import MantencionesPanel from '@/components/admin/MantencionesPanel'

export const dynamic = 'force-dynamic'

export default async function MantencionesPage() {
  const { data, error } = await getMantenciones() as {
    data: Awaited<ReturnType<typeof getMantenciones>>['data']
    error?: string
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Mantenciones cerámicas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cada cerámico completado programa su mantención a 6 meses. Los avisos salen solos;
          acá controlas los que necesitan seguimiento personal.
        </p>
      </header>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el calendario: {error}
          <p className="mt-1 text-xs">
            ¿Ejecutaste <code>supabase/17_calendario_mantencion.sql</code> en Supabase?
          </p>
        </div>
      )}

      <MantencionesPanel filas={data} />
    </div>
  )
}
