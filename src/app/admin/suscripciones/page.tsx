import SuscripcionesPanel from '@/components/admin/SuscripcionesPanel'

export const metadata = { title: 'Suscripciones | Fullshine Admin' }
export const dynamic = 'force-dynamic'

export default function SuscripcionesPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Suscripciones</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Clientes con plan anual pagado. Los lavados se marcan a mano.
        </p>
      </div>

      <SuscripcionesPanel />
    </div>
  )
}
