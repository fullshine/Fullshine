import { getBorradores } from '@/actions/borradores'
import IncompletasPanel from '@/components/admin/IncompletasPanel'

export const dynamic = 'force-dynamic'

export default async function IncompletasPage() {
  const { data, error } = await getBorradores() as {
    data: Awaited<ReturnType<typeof getBorradores>>['data']
    error?: string
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Reservas incompletas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personas que entregaron sus datos y no llegaron a confirmar. Todas
          aceptaron el aviso de contacto por WhatsApp al completar el formulario.
        </p>
      </header>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar la lista: {error}
          <p className="mt-1 text-xs">
            ¿Ejecutaste <code>supabase/19_reservas_incompletas.sql</code> en Supabase?
          </p>
        </div>
      )}

      <IncompletasPanel filas={data} />

      <p className="mt-8 text-xs text-gray-400 leading-relaxed">
        Escribe dentro de las primeras horas: la probabilidad de recuperar la reserva
        cae fuerte pasado un día. Y si alguien pide que no le escribas más, márcalo
        como descartado de inmediato.
      </p>
    </div>
  )
}
