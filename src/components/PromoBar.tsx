'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PROMO_END, PROMO_SHORT } from '@/lib/promo'

/**
 * Huincha de promoción con cuenta regresiva real.
 *
 * El contador se calcula contra PROMO_END, una fecha absoluta: si el usuario
 * vuelve mañana, el reloj marca menos tiempo o la barra desaparece. No es un
 * temporizador que se reinicia por sesión.
 *
 * La altura se publica en la variable CSS --promo-h para que el resto del
 * layout se desplace sin saltos (evita CLS).
 */

const DISMISSED_KEY = `promo_dismissed_${PROMO_END}`
const BAR_H = 46

function dosDigitos(n: number) {
  return n.toString().padStart(2, '0')
}

export default function PromoBar() {
  const [visible, setVisible] = useState(false)
  const [msLeft, setMsLeft] = useState(0)

  useEffect(() => {
    // La clave incluye PROMO_END: si lanzas una promo nueva, quien la cerró
    // antes vuelve a verla, en vez de quedar oculta para siempre.
    if (sessionStorage.getItem(DISMISSED_KEY)) {
      document.documentElement.style.setProperty('--promo-h', '0px')
      return
    }

    function tick() {
      const restante = PROMO_END - Date.now()
      if (restante <= 0) {
        setVisible(false)
        document.documentElement.style.setProperty('--promo-h', '0px')
        return false
      }
      setMsLeft(restante)
      return true
    }

    if (!tick()) return

    setVisible(true)
    const alto = window.innerWidth < 768 ? '58px' : `${BAR_H}px`
    document.documentElement.style.setProperty('--promo-h', alto)

    const id = setInterval(() => {
      if (!tick()) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [])

  function cerrar() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    document.documentElement.style.setProperty('--promo-h', '0px')
  }

  if (!visible) return null

  const totalSeg = Math.floor(msLeft / 1000)
  const horas = Math.floor(totalSeg / 3600)
  const min = Math.floor((totalSeg % 3600) / 60)
  const seg = totalSeg % 60
  const reloj = `${dosDigitos(horas)}:${dosDigitos(min)}:${dosDigitos(seg)}`

  return (
    <div
      role="region"
      aria-label="Promoción por tiempo limitado"
      className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-between gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-3 py-2 text-black md:px-4 md:py-0"
      style={{ minHeight: BAR_H }}
    >
      {/* Móvil */}
      <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-xs md:hidden">
        <span className="font-black">🔥 {PROMO_SHORT} en cerámicos</span>
        <span
          className="rounded-full bg-black px-2 py-0.5 font-black tabular-nums text-amber-400"
          aria-label={`Termina en ${horas} horas y ${min} minutos`}
        >
          {reloj}
        </span>
        <Link href="/reservar?categoria=ceramico"
          className="rounded-full bg-black px-3 py-1 font-bold text-amber-400">
          Reservar →
        </Link>
      </div>

      {/* Escritorio */}
      <div className="hidden flex-1 items-center justify-center gap-4 text-sm md:flex">
        <span className="font-black tracking-wide">🔥 SOLO POR HOY</span>
        <span className="font-medium">
          <strong>{PROMO_SHORT}</strong> en todos los tratamientos cerámicos
        </span>
        <span className="text-black/50" aria-hidden="true">·</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-black/60">Termina en</span>
        <span
          className="rounded-full bg-black px-3 py-0.5 font-black tabular-nums tracking-widest text-amber-400"
          aria-label={`Termina en ${horas} horas y ${min} minutos`}
        >
          {reloj}
        </span>
        <Link href="/reservar?categoria=ceramico"
          className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-amber-400 transition-colors hover:bg-gray-900">
          Reservar →
        </Link>
      </div>

      <button
        onClick={cerrar}
        aria-label="Cerrar aviso de promoción"
        className="shrink-0 px-2 text-lg font-light leading-none text-black/50 transition-colors hover:text-black"
      >
        ✕
      </button>
    </div>
  )
}
