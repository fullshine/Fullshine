'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const SEEN_KEY = 'exit_intent_25_seen'
const START_KEY = 'promo25_start'
const DURATION = 20 * 60

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(DURATION)

  // Exit-intent: trigger when mouse leaves viewport por arriba
  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return

    let fired = false

    function show() {
      if (fired) return
      fired = true
      setOpen(true)
      sessionStorage.setItem(SEEN_KEY, '1')
      cleanup()
    }

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) show()
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    function cleanup() {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    return cleanup
  }, [])

  // Countdown sincronizado con PromoBar (mismo START_KEY)
  useEffect(() => {
    if (!open) return

    const start = parseInt(sessionStorage.getItem(START_KEY) || Date.now().toString())

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      setSecondsLeft(Math.max(0, DURATION - elapsed))
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [open])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-gray-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-center">
              <p className="text-black font-black text-sm tracking-wide uppercase">⏰ ¡Espera! Tu oferta sigue activa</p>
            </div>

            {/* Contenido */}
            <div className="px-6 py-7 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Descuentos especiales por tiempo limitado</p>

              {/* Descuentos */}
              <div className="space-y-3 mb-5">
                <div className="bg-gray-800/80 rounded-xl px-5 py-3 border border-amber-500/20">
                  <p className="text-gray-400 text-xs mb-0.5">Tratamiento Cerámico</p>
                  <p className="text-amber-400 font-black text-3xl">25% OFF</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl px-5 py-3 border border-white/5">
                  <p className="text-gray-400 text-xs mb-0.5">Resto de servicios</p>
                  <p className="text-white font-black text-3xl">10% OFF</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-2">Tu oferta expira en:</p>
              <div className="bg-gray-800 rounded-xl px-6 py-3 mb-6 inline-block border border-white/5">
                <span className="text-amber-400 font-black text-4xl tabular-nums">{pad(m)}:{pad(s)}</span>
              </div>

              <Link
                href="/reservar"
                onClick={() => setOpen(false)}
                className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20 mb-3"
              >
                Quiero mi descuento →
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
              >
                No gracias, prefiero pagar precio completo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
