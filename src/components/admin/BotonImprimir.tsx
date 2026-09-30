'use client'

/** El certificado se renderiza en el servidor; solo este botón necesita el navegador. */
export default function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-amber-400 px-4 py-1.5 text-sm font-bold text-black hover:bg-amber-300"
    >
      Guardar como PDF
    </button>
  )
}
