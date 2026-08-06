import Link from 'next/link'

/**
 * Migas de pan visibles + accesibles.
 * El JSON-LD correspondiente se genera aparte con schemaBreadcrumb(),
 * para no duplicar el bloque dentro de cada página.
 */
export default function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[]
}) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={it.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-gray-400">{it.name}</span>
              ) : (
                <>
                  <Link href={it.path} className="hover:text-amber-400 transition-colors">
                    {it.name}
                  </Link>
                  <span aria-hidden="true" className="text-gray-700">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
