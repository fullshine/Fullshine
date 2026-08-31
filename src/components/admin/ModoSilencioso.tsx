'use client'

import { useState, useEffect, useTransition } from 'react'
import { getModoSilencioso, cambiarModoSilencioso } from '@/actions/admin'
import { cn } from '@/lib/utils'

/**
 * Corta de golpe todos los WhatsApp automáticos.
 *
 * Sirve en tres momentos: cuando Green API está caído y no quieres que el
 * sistema marque como enviados mensajes que nunca salieron, cuando cargas
 * clientes antiguos en lote, y cuando pruebas el flujo con datos reales.
 */
export default function ModoSilencioso() {
  const [activo, setActivo] = useState<boolean | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getModoSilencioso().then(r => setActivo(r.success ? !!r.data : false))
  }, [])

  function alternar() {
    if (activo === null) return
    const nuevo = !activo
    setError(null)
    startTransition(async () => {
      const r = await cambiarModoSilencioso(nuevo)
      if (!r.success) { setError(r.error ?? 'No se pudo guardar'); return }
      setActivo(nuevo)
    })
  }

  if (activo === null) return null

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-colors',
      activo ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <span>{activo ? '🔕' : '🔔'}</span>
            {activo ? 'Modo silencioso activado' : 'Avisos automáticos activos'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {activo
              ? 'No sale ningún WhatsApp: ni confirmaciones, ni recordatorios, ni certificados, ni reseñas.'
              : 'El sistema envía confirmaciones, recordatorios, certificados y solicitudes de reseña.'}
          </p>
        </div>

        <button onClick={alternar} disabled={pending}
          role="switch" aria-checked={activo}
          className={cn(
            'relative w-12 h-6 rounded-full shrink-0 transition-colors disabled:opacity-50',
            activo ? 'bg-amber-500' : 'bg-gray-300'
          )}>
          <span className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
            activo ? 'left-[26px]' : 'left-0.5'
          )} />
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
