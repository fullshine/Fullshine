'use client'

/**
 * Pantalla que ve un cliente cuando algo revienta en el sitio público.
 *
 * Antes, si la base de datos no respondía, la página quedaba en blanco: el
 * cliente se iba sin saber qué pasó y sin forma de contactarnos. Acá lo
 * importante no es el error, es que el teléfono quede a la vista.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-gray-400">Fullshine Detailing</p>

        <h1 className="text-xl font-bold text-gray-900">
          No pudimos cargar esta página
        </h1>

        <p className="text-sm text-gray-600 leading-relaxed">
          Tuvimos un problema técnico momentáneo. No es culpa tuya ni de tu conexión.
          Si querías reservar una hora, escríbenos directo y lo hacemos por ti al tiro.
        </p>

        <div className="space-y-2 pt-1">
          <a
            href="https://wa.me/56933654943?text=Hola%20Fullshine%2C%20la%20p%C3%A1gina%20no%20me%20carga%20y%20quiero%20reservar%20una%20hora"
            className="block w-full py-3 rounded-lg bg-green-500 text-white font-semibold"
          >
            Escribir por WhatsApp
          </a>

          <a href="tel:+56933654943" className="block w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium">
            Llamar al +56 9 3365 4943
          </a>

          <button onClick={reset} className="block w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            Reintentar
          </button>
        </div>

        <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
          Camilo Henríquez 381, Concepción · Lun a Vie 09:00–18:00 · Sáb 09:00–14:00
        </p>
      </div>
    </div>
  )
}
