'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DURATION = 20 * 60 // 20 minutos en segundos
const START_KEY = 'promo25_start'
const DISMISSED_KEY = 'promo25_dismissed'
const BAR_H = 44 // px

export default function PromoBar() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true)
      document.documentElement.style.setProperty('--promo-h', '0px')
      return
    }

    let start = parseInt(sessionStorage.getItem(START_KEY) || '0')
    if (!start) {
      start = Date.now()
      sessionStorage.setItem(START_KEY, start.toString())
    }

    document.documentElement.style.setProperty('--promo-h', `${BAR_H}px`)

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const left = Math.max(0, DURATION - elapsed)
      setSecondsLeft(left)
      if (left === 0) {
        clearInterval(id)
        document.documentElement.style.setProperty('--promo-h', '0px')
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
    document.documentElement.style.setProperty('--promo-h', '0px')
  }

  if (dismissed || secondsLeft === null || secondsLeft === 0) return null

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] bg-amber-500 text-black flex items-center justify-between gap-2 px-4"
      style={{ height: BAR_H }}
    >
      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center flex-wrap text-sm">
        <span className="font-black">🔥 OFERTA ESPECIAL</span>
        <span className="hidden md:inline font-medium">Cerámico <strong>25% OFF</strong> · Otros servicios <strong>10% OFF</strong></span>
        <span className="inline md:hidden font-medium">Cerámico 25% · Otros 10%</span>
        <div className="bg-black text-amber-400 font-black px-3 py-0.5 rounded-full tabular-nums text-sm tracking-wider">
          {pad(m)}:{pad(s)}
        </div>
        <Link
          href="/reservar"
          className="bg-black text-amber-400 hover:bg-gray-900 font-bold text-xs px-4 py-1.5 rounded-full transition-colors"
        >
          Reservar →
        </Link>
      </div>
      <button onClick={dismiss} className="text-black/50 hover:text-black shrink-0 text-lg font-bold leading-none">
        ✕
      </button>
    </div>
  )
}
