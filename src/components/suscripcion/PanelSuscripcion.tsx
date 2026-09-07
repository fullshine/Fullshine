'use client'

import { useTransition } from 'react'
import { salirSuscripcion } from '@/actions/suscripciones'
import { agruparPorMes, ETIQUETA_FRECUENCIA } from '@/lib/suscripciones'
import type { Avance } from '@/lib/suscripciones'
import type { Suscripcion, Lavado, Extra } from '@/actions/suscripciones'
import { formatCurrency } from '@/lib/utils'
import { aFecha } from '@/lib/fechas'

function fechaLarga(iso: string) {
  return aFecha(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export default function PanelSuscripcion({ suscripcion: s, lavados, extras, avance }: {
  suscripcion: Suscripcion
  lavados: Lavado[]
  extras: Extra[]
  avance: Avance
}) {
  const [, start] = useTransition()

  const porCobrar = extras.filter(e => !e.pagado).reduce((t, e) => t + e.precio_clp, 0)
  const totalExtras = extras.reduce((t, e) => t + e.precio_clp, 0)

  const color = avance.vencida ? 'bg-gray-400'
    : avance.disponibles === 0 ? 'bg-red-500'
    : avance.diferencia >= 2 ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera */}
      <div className="bg-gray-900 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-gray-400">Fullshine Detailing</p>
          <h1 className="text-2xl font-bold mt-1">{s.nombre}</h1>
          <p className="text-sm text-gray-300 mt-1">
            {ETIQUETA_FRECUENCIA[s.frecuencia]}
            {s.vehiculo && ` · ${s.vehiculo}`}
            {s.patente && ` (${s.patente})`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-5 -mt-4">

        {/* Estado del plan */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <p className="text-4xl font-bold text-gray-900 leading-none">
                {avance.realizados}
                <span className="text-xl text-gray-400 font-normal">/{s.lavados_totales}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">lavados usados</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 leading-none">{avance.disponibles}</p>
              <p className="text-xs text-gray-500 mt-1">te quedan</p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${color}`}
              style={{ width: `${avance.progreso}%` }} />
          </div>

          <p className="text-sm text-gray-600 mt-3">{avance.mensaje}</p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Plan desde</p>
              <p className="text-gray-900">{fechaLarga(s.inicio)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Vence</p>
              <p className="text-gray-900">{fechaLarga(s.termino)}</p>
            </div>
          </div>
        </div>

        {/* Servicios adicionales */}
        {extras.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-bold text-gray-900">Servicios adicionales</h2>
              <p className="text-xs text-gray-500">{formatCurrency(totalExtras)} en el año</p>
            </div>

            {porCobrar > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3 text-sm text-amber-800">
                Pendiente de pago: <strong>{formatCurrency(porCobrar)}</strong>
              </div>
            )}

            <div className="space-y-3">
              {agruparPorMes(extras).map(g => (
                <div key={g.mes}>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 capitalize mb-1">
                    {g.etiqueta}
                  </p>
                  <div className="divide-y divide-gray-100">
                    {g.items.map(e => (
                      <div key={e.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 truncate">{e.descripcion}</p>
                          <p className="text-[11px] text-gray-400">{fechaLarga(e.fecha)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(e.precio_clp)}</p>
                          <p className={`text-[11px] ${e.pagado ? 'text-green-600' : 'text-amber-600'}`}>
                            {e.pagado ? 'pagado' : 'por pagar'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial de lavados */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Lavados realizados</h2>

          {lavados.length === 0 ? (
            <p className="text-sm text-gray-400">
              Todavía no registramos lavados en tu plan.
            </p>
          ) : (
            <div className="space-y-3">
              {agruparPorMes(lavados).map(g => (
                <div key={g.mes}>
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 capitalize">
                      {g.etiqueta}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {g.items.length} {g.items.length === 1 ? 'lavado' : 'lavados'}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {g.items.map(l => (
                      <div key={l.id} className="flex items-center gap-2 py-2">
                        <span className="text-emerald-500">✓</span>
                        <span className="text-sm text-gray-700">{fechaLarga(l.fecha)}</span>
                        {l.detalle && <span className="text-xs text-gray-400 truncate">{l.detalle}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pb-8">
          <a href="https://wa.me/56933654943" target="_blank" rel="noopener noreferrer"
            className="text-sm text-brand-600 font-medium">
            Escribirnos por WhatsApp
          </a>
          <button className="text-xs text-gray-400 hover:text-gray-600"
            onClick={() => start(async () => { await salirSuscripcion(s.slug); location.reload() })}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
