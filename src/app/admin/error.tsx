'use client'

/**
 * Error dentro del panel. Acá el usuario eres tú, así que conviene mostrar el
 * mensaje real y la causa más probable en vez de un texto genérico.
 *
 * La caída más común no es un bug del código: es Supabase quedando Unhealthy
 * o pausado, y desde el panel eso se ve exactamente igual que un error.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pareceBaseCaida = /fetch failed|network|ECONNREFUSED|timeout|Failed to fetch/i
    .test(error.message)

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-bold text-red-900">Error en el panel</h2>
        <p className="text-sm text-red-800 mt-2 break-words">{error.message}</p>
        {error.digest && (
          <p className="text-[11px] text-red-400 mt-2">Referencia: {error.digest}</p>
        )}
      </div>

      {pareceBaseCaida && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mt-4">
          <p className="font-semibold text-amber-900 text-sm">
            Esto parece la base de datos, no el sitio
          </p>
          <p className="text-sm text-amber-800 mt-2 leading-relaxed">
            Entra a Supabase y mira el Status del proyecto. Si dice
            <strong> Unhealthy</strong>, anda a Settings → General → Restart project.
            Si dice <strong>Paused</strong>, apreta Restore. En ambos casos tarda unos
            minutos y no se pierde ningún dato.
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm font-medium text-amber-900 underline"
          >
            Abrir Supabase
          </a>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button onClick={reset} className="btn-primary flex-1">
          Reintentar
        </button>
        <a href="/admin/dashboard" className="btn-secondary flex-1 text-center">
          Ir al inicio
        </a>
      </div>
    </div>
  )
}
