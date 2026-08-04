'use client'

import { useState, useTransition } from 'react'
import {
  actualizarMantencion,
  posponerMantencion,
  enviarRecordatorioAhora,
  correrMotorMantenciones,
  type MantencionFila,
} from '@/actions/mantenciones'

const ESTADOS: Record<string, { label: string; clase: string }> = {
  pending:   { label: 'Programada',  clase: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'Contactado',  clase: 'bg-amber-100 text-amber-800' },
  scheduled: { label: 'Agendó hora', clase: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completada',  clase: 'bg-green-100 text-green-800' },
  declined:  { label: 'Rechazó',     clase: 'bg-red-50 text-red-600' },
  lost:      { label: 'Sin respuesta', clase: 'bg-gray-100 text-gray-400' },
}

function marcaModelo(v: Record<string, string | null> | null): string {
  const marca = v?.make ?? v?.brand ?? ''
  return `${marca} ${v?.model ?? ''}`.trim() || 'Vehículo'
}

function diasHasta(fecha: string): number {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return Math.round((new Date(fecha + 'T00:00:00').getTime() - hoy.getTime()) / 86_400_000)
}

function urgencia(dias: number): { texto: string; clase: string } {
  if (dias < 0)  return { texto: `Vencida hace ${Math.abs(dias)} días`, clase: 'text-red-600 font-bold' }
  if (dias === 0) return { texto: 'Vence hoy', clase: 'text-red-600 font-bold' }
  if (dias <= 30) return { texto: `En ${dias} días`, clase: 'text-amber-600 font-semibold' }
  return { texto: `En ${dias} días`, clase: 'text-gray-500' }
}

export default function MantencionesPanel({ filas }: { filas: MantencionFila[] }) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'activas' | 'todas'>('activas')

  const activas = filas.filter(f => ['pending', 'contacted', 'scheduled'].includes(f.status))
  const visibles = filtro === 'activas' ? activas : filas

  // Métricas
  const vencidas = activas.filter(f => diasHasta(f.due_at) < 0).length
  const proximas = activas.filter(f => { const d = diasHasta(f.due_at); return d >= 0 && d <= 30 }).length
  const completadas = filas.filter(f => f.status === 'completed').length
  const potencial = activas.length * 130_000

  function accion(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    startTransition(async () => {
      setMsg(null)
      const r = await fn()
      setMsg(r.success ? ok : `Error: ${r.error}`)
    })
  }

  return (
    <div className="space-y-5">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { v: vencidas,    l: 'Vencidas',            c: 'text-red-600' },
          { v: proximas,    l: 'Vencen en 30 días',   c: 'text-amber-600' },
          { v: activas.length, l: 'Activas en total', c: 'text-gray-900' },
          { v: completadas, l: 'Completadas',         c: 'text-green-600' },
        ].map(m => (
          <div key={m.l} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-black ${m.c}`}>{m.v}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.l}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>Potencial estimado:</strong>{' '}
          ${potencial.toLocaleString('es-CL')} en {activas.length} mantenciones pendientes
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Calculado con un ticket promedio de $130.000. La conversión real suele estar entre 40% y 50%.
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {(['activas', 'todas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 font-medium ${filtro === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
              {f === 'activas' ? `Activas (${activas.length})` : `Todas (${filas.length})`}
            </button>
          ))}
        </div>

        <button
          disabled={pending}
          onClick={() => startTransition(async () => {
            setMsg('Procesando…')
            const r = await correrMotorMantenciones()
            setMsg(r.success
              ? `Enviados: ${r.reporte?.primer_aviso.length ?? 0} primeros avisos, ${r.reporte?.seguimiento.length ?? 0} seguimientos`
              : `Error: ${r.error}`)
          })}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold disabled:opacity-50">
          ⚡ Enviar avisos pendientes
        </button>

        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>

      {/* Listado */}
      {visibles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">No hay mantenciones {filtro === 'activas' ? 'activas' : 'registradas'}.</p>
          <p className="text-sm text-gray-400 mt-2">
            Se crean solas al completar un cerámico en el CRM, o al cargar trabajos históricos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map(m => {
            const dias = diasHasta(m.due_at)
            const u = urgencia(dias)
            const estado = ESTADOS[m.status] ?? ESTADOS.pending
            const activa = ['pending', 'contacted', 'scheduled'].includes(m.status)

            return (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{m.customer?.full_name ?? 'Cliente'}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${estado.clase}`}>
                        {estado.label}
                      </span>
                      {m.cycle > 1 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                          {m.cycle}ª mantención
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      🚗 {marcaModelo(m.vehicle)} · 📱 {m.customer?.phone ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Cerámico aplicado el {m.applied_at} · Mantención el {m.due_at}
                    </p>
                    {(m.contact_1_at || m.contact_2_at) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {m.contact_1_at && `1er aviso: ${m.contact_1_at.substring(0, 10)}`}
                        {m.contact_2_at && ` · 2º aviso: ${m.contact_2_at.substring(0, 10)}`}
                      </p>
                    )}
                  </div>

                  <p className={`text-sm whitespace-nowrap ${u.clase}`}>{u.texto}</p>
                </div>

                {activa && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button disabled={pending}
                      onClick={() => accion(() => enviarRecordatorioAhora(m.id), 'Recordatorio enviado')}
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 disabled:opacity-50">
                      💬 Enviar recordatorio
                    </button>
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarMantencion(m.id, { status: 'scheduled' }), 'Marcada como agendada')}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 disabled:opacity-50">
                      📅 Agendó hora
                    </button>
                    <button disabled={pending}
                      onClick={() => accion(() => posponerMantencion(m.id, 3), 'Pospuesta 3 meses')}
                      className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 disabled:opacity-50">
                      ⏳ Posponer 3 meses
                    </button>
                    <button disabled={pending}
                      onClick={() => accion(() => actualizarMantencion(m.id, { status: 'declined' }), 'Marcada como rechazada')}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 disabled:opacity-50">
                      ✕ No le interesa
                    </button>
                    <a href={`https://wa.me/${(m.customer?.phone ?? '').replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold">
                      Abrir chat →
                    </a>
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
