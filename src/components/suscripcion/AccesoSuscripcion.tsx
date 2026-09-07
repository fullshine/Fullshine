'use client'

import { useState, useTransition } from 'react'
import { ingresarSuscripcion } from '@/actions/suscripciones'

export default function AccesoSuscripcion({ slug, nombre }: { slug: string; nombre: string }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const r = await ingresarSuscripcion(slug, codigo)
      if (!r.success) setError(r.error ?? 'No se pudo entrar')
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <form onSubmit={enviar} className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Fullshine Detailing</p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Hola, {nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa el código que te enviamos para ver tu plan.
          </p>
        </div>

        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value.toUpperCase())}
          placeholder="ABC123"
          autoCapitalize="characters"
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button type="submit" disabled={pending || codigo.length < 4}
          className="btn-primary w-full disabled:opacity-50">
          {pending ? 'Verificando…' : 'Entrar'}
        </button>

        <p className="text-[11px] text-gray-400 text-center">
          ¿Perdiste el código? Escríbenos al +56 9 3365 4943.
        </p>
      </form>
    </div>
  )
}
