'use client'

import { useState, useTransition } from 'react'
import {
  actualizarBorrador,
  recuperarPorWhatsApp,
  type Borrador,
} from '@/actions/borradores'

const ESTADOS: Record<string, { label: string; clase: string }> = {
  pendiente:  { label: 'Sin contactar', clase: 'bg-amber-100 text-amber-800' },
  contactado: { label: 'Contactado',    clase: 'bg-blue-100 text-blue-800' },
  descartado: { label: 'Descartado',    clase: 'bg-gray-100 text-gray-400' },
  convertido: { label: 'Convertido',    clase: 'bg-green-100 text-green-800' },
}

function horasDesde(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'hace minutos'
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`
}

export default function IncompletasPanel({ filas }: { filas: Borrador[] }) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'pendientes' | 'todas'>('pendientes')

  const pendientes = filas.filter(f => f.estado === 'pendiente')
  const visibles = filtro === 'pendientes' ? pendientes : filas
  const contactados = filas.filter(f => f.estado === 'contactado').length

  function accion(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    startTransition(async () => {
      setMsg(null)
      const r = await fn()
      setMsg(r.success ? ok : `Error: ${r.error}`)
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: pendientes.length, l: 'Sin contactar', c: 'text-amber-600' },
          { v: contactados,       l: 'Contactados',   c: 'text-blue-600' },
          { v: filas.length,      l: 'Total abiertos', c: 'text-gray-900' },
        ].map(m => (
          <div key={m.l} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-black ${m.c}`}>{m.v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {(['pendientes', 'todas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 font-medium ${filtro === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
              {f === 'pendientes' ? `Sin contactar (${pendientes.length})` : `Todas (${filas.length})`}
            </button>
          ))}
        </div>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {visibles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">No hay reservas incompletas.</p>
          <p className="text-sm text-gray-400 mt-2">
            Aparecen solas cuando alguien entrega sus datos y no llega a confirmar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map(b => {
            const estado = ESTADOS[b.estado] ?? ESTADOS.pendiente
            const vehiculo = `${b.vehicle_make ?? ''} ${b.vehicle_model ?? ''}`.trim()
            const activo = b.estado === 'pendiente' || b.estado === 'contactado'

            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{b.full_name ?? 'Sin nombre'}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${estado.clase}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📱 {b.phone}
                      {vehiculo && <> · 🚗 {vehiculo}</>}
                    </p>
                    {b.service_name && (
                      <p className="text-sm text-gray-500 mt-0.5">Buscaba: {b.service_name}</p>
                    )}
                    {(b.booking_date || b.slot_start) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Fecha elegida: {b.booking_date ?? '—'} {b.slot_start ?? ''}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Abandonó {horasDesde(b.created_at)}
                      {b.contactado_at && ` · Contactado el ${b.contactado_at.substring(0, 10)}`}
                    </p>
                  </div>
                </div>

                {activo && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button disabled={pending}
                      onClick={() => accion(() => recuperarPorWhatsApp(b.id), '✅ Mensaje enviado')}
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 disabled:opacity-50">
                      💬 Enviar mensaje de recuperación
                    </button>
                    <a href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold">
                      Escribir yo mismo →
                    </a>
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarBorrador(b.id, { estado: 'descartado' }), 'Descartado')}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 disabled:opacity-50 ml-auto">
                      ✕ Descartar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
