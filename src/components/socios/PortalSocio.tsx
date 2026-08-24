'use client'

import { useState, useTransition } from 'react'
import { getEnlaceDocumento, salir, type Documento, type VehiculoAtendido } from '@/actions/socios'
import { formatCurrency } from '@/lib/utils'

type Pestana = 'agendar' | 'historial' | 'documentos'

const ICONO_TIPO: Record<string, string> = {
  factura: '🧾',
  informe: '📋',
  foto: '📷',
  otro: '📎',
}

const ESTADOS: Record<string, string> = {
  pending: 'Recibido',
  payment_received: 'En proceso',
  confirmed: 'Confirmado',
  in_progress: 'En trabajo',
  completed: 'Entregado',
  review_sent: 'Entregado',
}

function peso(bytes: number | null): string {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

export default function PortalSocio({
  slug,
  nombre,
  historial,
  documentos,
  children,
}: {
  slug: string
  nombre: string
  historial: VehiculoAtendido[]
  documentos: Documento[]
  /** Formulario de agendamiento, renderizado en el servidor */
  children: React.ReactNode
}) {
  const [tab, setTab] = useState<Pestana>('agendar')
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const facturas = documentos.filter(d => d.tipo === 'factura')
  const fotos = documentos.filter(d => d.tipo === 'foto')
  const otros = documentos.filter(d => d.tipo !== 'factura' && d.tipo !== 'foto')

  const q = busca.trim().toUpperCase()
  const historialFiltrado = q
    ? historial.filter(h =>
        (h.patente ?? '').toUpperCase().includes(q) ||
        h.vehiculo.toUpperCase().includes(q)
      )
    : historial

  function abrir(path: string) {
    startTransition(async () => {
      setMsg('Generando enlace…')
      const r = await getEnlaceDocumento(path)
      if (!r.success || !r.url) { setMsg(`Error: ${r.error}`); return }
      setMsg(null)
      window.open(r.url, '_blank', 'noopener')
    })
  }

  const TABS: { id: Pestana; label: string; badge?: number }[] = [
    { id: 'agendar', label: 'Agendar' },
    { id: 'historial', label: 'Historial', badge: historial.length },
    { id: 'documentos', label: 'Documentos', badge: documentos.length },
  ]

  return (
    <>
      {/* Pestañas */}
      <div className="mb-8 flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === t.id ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
            }`}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-black/60' : 'text-white/30'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {msg && <p className="mb-4 text-center text-sm text-gray-400">{msg}</p>}

      {/* ── AGENDAR ── */}
      {tab === 'agendar' && children}

      {/* ── HISTORIAL ── */}
      {tab === 'historial' && (
        <div>
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por patente o modelo…"
            className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none"
          />

          {historialFiltrado.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-gray-400">
                {q ? 'Ningún vehículo coincide con la búsqueda.' : 'Todavía no hay vehículos atendidos.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historialFiltrado.map(h => (
                <div key={h.booking_id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">
                        {h.vehiculo}
                        {h.patente && (
                          <span className="ml-2 rounded bg-white/10 px-2 py-0.5 font-mono text-xs tracking-wider text-white/70">
                            {h.patente}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">{h.servicio}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{h.fecha}</p>
                      <p className="mt-0.5 text-xs font-semibold text-amber-400">
                        {ESTADOS[h.estado] ?? h.estado}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-white/35">
            Este historial les sirve para responder qué preparación recibió cada
            unidad al momento de venderla.
          </p>
        </div>
      )}

      {/* ── DOCUMENTOS ── */}
      {tab === 'documentos' && (
        <div className="space-y-8">
          {documentos.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-gray-400">Todavía no hay documentos cargados.</p>
              <p className="mt-2 text-sm text-gray-500">
                Acá van a aparecer las facturas, informes y registros fotográficos.
              </p>
            </div>
          ) : (
            <>
              {/* Estado de cuenta */}
              {facturas.length > 0 && (() => {
                const pendientes = facturas.filter(f => !f.pagada)
                const monto = pendientes.reduce((s, f) => s + (f.monto_clp ?? 0), 0)
                if (pendientes.length === 0) {
                  return (
                    <div className="rounded-xl border border-green-500/25 bg-green-500/[0.07] p-4 text-center">
                      <p className="text-sm font-bold text-green-400">
                        ✓ No hay facturas pendientes
                      </p>
                    </div>
                  )
                }
                return (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
                    <p className="text-xs uppercase tracking-wider text-amber-400/70">Pendiente de pago</p>
                    <p className="mt-1 text-2xl font-black text-amber-400">{formatCurrency(monto)}</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {pendientes.length} {pendientes.length === 1 ? 'factura' : 'facturas'}
                    </p>
                  </div>
                )
              })()}

              {[
                { t: 'Facturas', items: facturas },
                { t: 'Registro fotográfico', items: fotos },
                { t: 'Otros documentos', items: otros },
              ].filter(g => g.items.length > 0).map(g => (
                <section key={g.t}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
                    {g.t}
                  </h2>
                  <div className="space-y-2">
                    {g.items.map(d => (
                      <button key={d.id} disabled={pending} onClick={() => abrir(d.file_path)}
                        className="flex w-full items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-colors hover:border-amber-500/30 hover:bg-white/[0.04] disabled:opacity-50">
                        <span className="text-2xl" aria-hidden>{ICONO_TIPO[d.tipo] ?? '📎'}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="truncate font-semibold text-white">{d.titulo}</p>
                            {d.tipo === 'factura' && (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                d.pagada
                                  ? 'bg-green-500/15 text-green-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}>
                                {d.pagada ? 'PAGADA' : 'PENDIENTE'}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-white/40">
                            {d.created_at.substring(0, 10)}
                            {d.periodo && ` · ${d.periodo}`}
                            {d.patente && ` · ${d.patente}`}
                            {d.monto_clp ? ` · ${formatCurrency(d.monto_clp)}` : ''}
                            {d.file_size ? ` · ${peso(d.file_size)}` : ''}
                          </p>
                          {d.descripcion && (
                            <p className="mt-1 text-xs leading-relaxed text-white/50">{d.descripcion}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-bold text-amber-400">Abrir →</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      )}

      <div className="mt-12 border-t border-white/5 pt-6 text-center">
        <button
          onClick={() => startTransition(async () => { await salir(slug) })}
          className="text-xs text-white/30 transition-colors hover:text-white/60">
          Cerrar sesión en este dispositivo
        </button>
      </div>
    </>
  )
}
