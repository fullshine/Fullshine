import Link from 'next/link'
import Image from 'next/image'

/**
 * Navegación principal.
 *
 * Se añadieron enlaces a las páginas clave (cerámico, revisión gratis, nosotros)
 * porque antes el menú solo apuntaba a un ancla y a /reservar: las páginas de
 * servicio quedaban huérfanas de enlaces desde la navegación, que es una de las
 * señales de importancia más fuertes dentro de un sitio.
 */
const LINKS = [
  { href: '/sellado-ceramico-concepcion', label: 'Tratamiento cerámico' },
  { href: '/detailing-concepcion',        label: 'Detailing' },
  { href: '/revision-gratis-concepcion',  label: 'Revisión gratis', destacado: true },
  { href: '/nosotros',                    label: 'Nosotros' },
]

export default function SiteNav() {
  return (
    <nav aria-label="Navegación principal"
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Fullshine Detailing Premium — Inicio">
          <Image src="/logo.png" alt="" width={40} height={40} className="rounded-full" priority />
          <div className="hidden sm:block">
            <p className="font-bold text-white leading-none tracking-wide text-sm">FULLSHINE</p>
            <p className="text-xs text-gray-400 tracking-widest uppercase">Detailing Premium</p>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <ul className="hidden lg:flex items-center gap-5">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href}
                  className={`text-sm transition-colors ${
                    l.destacado
                      ? 'text-green-400 hover:text-green-300 font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/reservar"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-5 py-2 rounded-full transition-colors shrink-0">
            Reservar
          </Link>
        </div>
      </div>
    </nav>
  )
}
