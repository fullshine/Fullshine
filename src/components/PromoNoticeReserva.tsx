'use client'

import { useState, useEffect } from 'react'
import { PROMO_END, PROMO_SHORT, PROMO_CERAMICO } from '@/lib/promo'

/**
 * Aviso de promoción dentro de la página de reserva, con el mismo contador
 * que la huincha superior. Refuerza la urgencia justo en el momento de decidir,
 * que es donde más pesa.
 *
 * Se oculta solo cuando la promo termina.
 */
export default function PromoNoticeReserva() {
  const [msLeft, setMsLeft] = useState<number | null>(null)

  useEffect(() => {
    function tick() {
      const restante = PROMO_END - Date.now()
      setMsLeft(restante > 0 ? restante : null)
      return restante > 0
    }
    if (!tick()) return
    const id = setInterval(() => { if (!tick()) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, [])

  if (msLeft === null || PROMO_CERAMICO <= 0) return null

  const t = Math.floor(msLeft / 1000)
  const dd = (n: number) => n.toString().padStart(2, '0')
  const reloj = `${dd(Math.floor(t / 3600))}:${dd(Math.floor((t % 3600) / 60))}:${dd(t % 60)}`

  return (
    <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
      <p className="text-sm font-black text-green-400">
        🔥 {PROMO_SHORT} en tratamientos cerámicos
      </p>
      <p className="mt-1 text-xs text-green-200/70">
        El descuento ya viene aplicado en los precios de abajo. Termina en{' '}
        <span className="font-black tabular-nums text-green-300">{reloj}</span>
      </p>
    </div>
  )
}
