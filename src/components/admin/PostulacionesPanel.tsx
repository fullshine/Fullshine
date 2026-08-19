'use client'

import { useState, useTransition } from 'react'
import {
  actualizarPostulacion,
  getEnlaceCV,
  type Postulacion,
} from '@/actions/postulaciones'

const ESTADOS: Record<string, { label: string; clase: string }> = {
  nueva:      { label: 'Nueva',       clase: 'bg-amber-100 text-amber-800' },
  revisada:   { label: 'Revisada',    clase: 'bg-blue-100 text-blue-800' },
  contactada: { label: 'Contactada',  clase: 'bg-green-100 text-green-800' },
  descartada: { label: 'Descartada',  clase: 'bg-gray-100 text-gray-400' },
}

export default function PostulacionesPanel({ filas }: { filas: Postulacion[] }) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'abiertas' | 'todas'>('abiertas')

  const abiertas = filas.filter(f => f.estado !== 'descartada')
  const visibles = filtro === 'abiertas' ? abiertas : filas
  const nuevas = filas.filter(f => f.estado === 'nueva').length

  function accion(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    startTransition(async () => {
      setMsg(null)
      const r = await fn()
      setMsg(r.success ? ok : `Error: ${r.error}`)
    })
  }

  /** El CV vive en un bucket privado: se pide un enlace firmado al momento. */
  function abrirCV(path: string) {
    startTransition(async () => {
      setMsg('Generando enlace…')
      const r = await getEnlaceCV(path)
      if (!r.success || !r.url) { setMsg(`Error: ${r.error}`); return }
      setMsg(null)
      window.open(r.url, '_blank', 'noopener')
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: nuevas, l: 'Sin revisar', c: 'text-amber-600' },
          { v: abiertas.length, l: 'Abiertas', c: 'text-gray-900' },
          { v: filas.length, l: 'Total recibidas', c: 'text-gray-500' },
        ].map(m => (
          <div key={m.l} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-black ${m.c}`}>{m.v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {(['abiertas', 'todas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 font-medium ${filtro === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
              {f === 'abiertas' ? `Abiertas (${abiertas.length})` : `Todas (${filas.length})`}
            </button>
          ))}
        </div>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {visibles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">Todavía no hay postulaciones.</p>
          <p className="text-sm text-gray-400 mt-2">
            Aparecen acá apenas alguien completa el formulario de{' '}
            <code>/trabaja-con-nosotros</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map(p => {
            const estado = ESTADOS[p.estado] ?? ESTADOS.nueva
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{p.full_name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${estado.clase}`}>
                        {estado.label}
                      </span>
                      {p.tiene_licencia && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                          Licencia B
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📱 {p.phone}
                      {p.email && <> · ✉️ {p.email}</>}
                      {p.comuna && <> · 📍 {p.comuna}</>}
                    </p>
                    {p.area && <p className="text-sm text-gray-500 mt-0.5">Área: {p.area}</p>}
                    {p.experiencia && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                        {p.experiencia}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Recibida el {p.created_at.substring(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                  {p.cv_path ? (
                    <button disabled={pending} onClick={() => abrirCV(p.cv_path!)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 disabled:opacity-50">
                      📄 Ver CV{p.cv_nombre ? ` (${p.cv_nombre})` : ''}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 text-xs text-gray-400">Sin CV adjunto</span>
                  )}

                  <a href={`https://wa.me/${p.phone.replace(/\D/g, '').length === 9 ? '56' + p.phone.replace(/\D/g, '') : p.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                    💬 WhatsApp
                  </a>

                  {p.estado === 'nueva' && (
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarPostulacion(p.id, { estado: 'revisada' }), 'Marcada como revisada')}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold disabled:opacity-50">
                      Marcar revisada
                    </button>
                  )}
                  {p.estado !== 'contactada' && p.estado !== 'descartada' && (
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarPostulacion(p.id, { estado: 'contactada' }), 'Marcada como contactada')}
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 disabled:opacity-50">
                      ✓ Ya la contacté
                    </button>
                  )}
                  {p.estado !== 'descartada' && (
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarPostulacion(p.id, { estado: 'descartada' }), 'Descartada')}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 disabled:opacity-50 ml-auto">
                      ✕ Descartar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
