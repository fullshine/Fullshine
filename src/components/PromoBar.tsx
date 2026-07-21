'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Fin de la promo: 31 de julio 2026, 23:59 hora de Chile (UTC-4)
const PROMO_END = new Date('2026-08-01T03:59:00Z').getTime()
const DISMISSED_KEY = 'promo25_dismissed'
const BAR_H = 44 // px (desktop); mobile uses auto height via min-height

export default function PromoBar() {
  const [visible, setVisible] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) {
      document.documentElement.style.setProperty('--promo-h', '0px')
      return
    }

    const msLeft = PROMO_END - Date.now()
    if (msLeft <= 0) {
      // Promo terminada: no mostrar nada
      document.documentElement.style.setProperty('--promo-h', '0px')
      return
    }

    setDaysLeft(Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24))))
    setVisible(true)

    const isMobile = window.innerWidth < 768
    document.documentElement.style.setProperty('--promo-h', isMobile ? '56px' : `${BAR_H}px`)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    document.documentElement.style.setProperty('--promo-h', '0px')
  }

  if (!visible) return null

  const deadline = daysLeft === 1 ? '¡Último día!' : `Quedan ${daysLeft} días`

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] bg-amber-500 text-black flex items-center justify-between gap-2 px-3 md:px-4 py-2 md:py-0"
      style={{ minHeight: BAR_H }}
    >
      {/* Mobile layout */}
      <div className="flex md:hidden items-center gap-2 flex-1 justify-center text-sm flex-wrap">
        <span className="font-black text-xs">🔥 25% OFF cerámico · solo julio</span>
        <div className="bg-black text-amber-400 font-black px-2 py-0.5 rounded-full text-xs tracking-wide">
          {deadline}
        </div>
        <Link
          href="/reservar"
          className="bg-black text-amber-400 font-bold text-xs px-3 py-1 rounded-full"
        >
          Reservar →
        </Link>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-4 flex-1 justify-center text-sm">
        <span className="font-black">🔥 PROMO DE JULIO</span>
        <span className="font-medium">Cerámico <strong>25% OFF</strong> · Otros servicios <strong>10% OFF</strong> · hasta el 31 de julio</span>
        <div className="bg-black text-amber-400 font-black px-3 py-0.5 rounded-full text-sm tracking-wide">
          {deadline}
        </div>
        <Link
          href="/reservar"
          className="bg-black text-amber-400 hover:bg-gray-900 font-bold text-xs px-4 py-1.5 rounded-full transition-colors"
        >
          Reservar →
        </Link>
      </div>

      <button onClick={dismiss} aria-label="Cerrar promoción" className="text-black/50 hover:text-black shrink-0 text-lg font-bold leading-none ml-1 p-2 -m-1">
        ✕
      </button>
    </div>
  )
}
