'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function PromoModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('promo_inauguracion')
    if (seen) return

    let fired = false

    function show() {
      if (fired) return
      fired = true
      setOpen(true)
      cleanup()
    }

    // Exit intent: mouse saliendo por arriba del viewport
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) show()
    }

    // Fallback: mostrar después de 8 segundos
    const timer = setTimeout(show, 8000)

    function cleanup() {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return cleanup
  }, [])

  function close() {
    sessionStorage.setItem('promo_inauguracion', '1')
    setOpen(false)
  }

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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-gray-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Franja superior */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-center">
              <p className="text-black font-black text-sm tracking-widest uppercase">🎉 Oferta Inauguración · 1 de Julio</p>
            </div>

            {/* Contenido */}
            <div className="px-8 py-8 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Solo para los primeros</p>
              <p className="text-amber-400 font-black text-7xl leading-none mb-1">10</p>
              <p className="text-white font-bold text-lg mb-6">clientes</p>

              <div className="bg-gray-800/60 rounded-xl px-6 py-4 mb-6 border border-white/5">
                <p className="text-gray-400 text-sm mb-1">Descuento en</p>
                <p className="text-white font-bold text-xl">Tratamiento Cerámico</p>
                <p className="text-amber-400 font-black text-4xl mt-1">40% OFF</p>
              </div>

              <Link
                href="/reservar"
                onClick={close}
                className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20 mb-3"
              >
                Quiero mi descuento →
              </Link>
              <button
                onClick={close}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
