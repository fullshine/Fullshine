'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { ingresar } from '@/actions/socios'

export default function AccesoSocio({ slug, nombre }: { slug: string; nombre: string }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const r = await ingresar(slug, codigo)
      if (!r.success) setError(r.error ?? 'No se pudo ingresar')
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Fullshine" width={72} height={72}
            className="mx-auto mb-5 rounded-full" priority />
          <h1 className="text-xl font-black text-white">Portal de socios</h1>
          <p className="mt-1.5 text-sm text-gray-400">{nombre}</p>
        </div>

        <form onSubmit={onSubmit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7">
          <label htmlFor="codigo" className="mb-2 block text-sm font-medium text-white/70">
            Código de acceso
          </label>
          <input
            id="codigo" value={codigo} autoFocus autoComplete="off"
            onChange={e => setCodigo(e.target.value)}
            placeholder="Ingresa el código"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-lg font-bold uppercase tracking-widest text-white placeholder:text-white/20 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />

          {error && (
            <p className="mt-3 text-center text-sm text-red-400">{error}</p>
          )}

          <button type="submit" disabled={pending || !codigo.trim()}
            className="mt-5 w-full rounded-full bg-amber-500 py-3.5 font-black text-black transition-all hover:bg-amber-400 disabled:opacity-40">
            {pending ? 'Verificando…' : 'INGRESAR'}
          </button>

          <p className="mt-5 text-center text-xs leading-relaxed text-white/35">
            El código lo entrega Fullshine. Queda guardado en este dispositivo
            por 60 días.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          ¿Perdiste el código?{' '}
          <a href="https://wa.me/56933654943" target="_blank" rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400">
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </main>
  )
}
