'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Error en el panel</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={reset} className="bg-brand-500 text-white px-4 py-2 rounded-lg">
        Reintentar
      </button>
    </div>
  )
}
