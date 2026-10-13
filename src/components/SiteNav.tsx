'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

const LINKS = [
  { href: '/#servicios', label: 'Servicios', desktop: true },
  { href: '/sellado-ceramico-concepcion', label: 'Cerámicos', desktop: true },
  { href: '/#caso-documentado', label: 'Caso real', desktop: true },
  { href: '/nosotros', label: 'Nosotros', desktop: true },
  { href: '/revision-gratis-concepcion', label: 'Diagnóstico gratis', desktop: true },
  { href: '/#resenas', label: 'Reseñas', desktop: false },
  { href: '/preguntas-frecuentes', label: 'Preguntas frecuentes', desktop: false },
  { href: '/#empresas', label: 'Empresas y flotas', desktop: false },
]

export default function SiteNav() {
  const menu = useRef<HTMLDetailsElement>(null)
  function closeMenu() {
    if (menu.current) menu.current.open = false
  }

  return (
    <nav aria-label="Navegación principal"
      style={{ top: 'var(--promo-h, 0px)' }}
      onKeyDown={event => {
        if (event.key === 'Escape' && menu.current?.open) {
          closeMenu()
          menu.current.querySelector('summary')?.focus()
        }
      }}
      className="fixed left-0 right-0 z-[65] border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" onClick={closeMenu} className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" aria-label="Fullshine — Inicio">
          <Image src="/logo.png" alt="" width={40} height={40} className="rounded-full" priority />
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-none tracking-wide text-white">FULLSHINE</span>
            <span className="mt-1 block text-xs uppercase tracking-widest text-gray-400">Detailing Premium</span>
          </span>
        </Link>
        <ul className="hidden items-center gap-5 lg:flex">
          {LINKS.filter(link => link.desktop).map(link => (
            <li key={link.href}>
              <Link href={link.href} className="rounded text-sm text-gray-200 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/reservar" onClick={closeMenu}
            className="inline-flex min-h-11 items-center rounded-full bg-amber-500 px-5 text-sm font-bold text-black transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
            Reservar
          </Link>
          <details ref={menu} className="group lg:hidden">
            <summary aria-label="Abrir o cerrar menú de navegación"
              className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden" aria-hidden="true">☰</span>
              <span className="hidden group-open:inline" aria-hidden="true">✕</span>
              Menú
            </summary>
            <div className="absolute left-0 right-0 top-full max-h-[calc(100dvh-120px)] overflow-y-auto border-b border-white/15 bg-gray-950 px-4 py-3 shadow-xl">
              <ul className="mx-auto max-w-6xl space-y-1">
                {LINKS.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={closeMenu}
                      className="flex min-h-11 items-center rounded-lg px-3 py-3 text-base text-gray-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </nav>
  )
}
