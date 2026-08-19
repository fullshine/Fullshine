import { getPostulaciones } from '@/actions/postulaciones'
import PostulacionesPanel from '@/components/admin/PostulacionesPanel'

export const dynamic = 'force-dynamic'

export default async function PostulacionesPage() {
  const { data, error } = await getPostulaciones() as {
    data: Awaited<ReturnType<typeof getPostulaciones>>['data']
    error?: string
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Postulaciones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personas que postularon desde{' '}
          <code className="text-xs">/trabaja-con-nosotros</code>.
          Los currículums se abren con un enlace temporal que expira a los 5 minutos.
        </p>
      </header>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar las postulaciones: {error}
          <p className="mt-1 text-xs">
            ¿Ejecutaste <code>supabase/20_postulaciones.sql</code> en Supabase?
          </p>
        </div>
      )}

      <PostulacionesPanel filas={data} />
    </div>
  )
}
