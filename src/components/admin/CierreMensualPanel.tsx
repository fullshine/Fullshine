'use client'

import { useState, useTransition } from 'react'
import { guardarCierre, cerrarMes, reabrirMes } from '@/actions/finanzas'
import type { PanelFinanzas } from '@/actions/finanzas'
import { cuadra, TASA_APARTAR_IMPUESTOS, DIA_CIERRE } from '@/lib/finanzas'
import { cn, formatCurrency } from '@/lib/utils'

/**
 * Cierre del mes: contrasta lo que dice el sistema con lo que realmente
 * ocurrió en el banco y en el SII.
 *
 * El valor está en la comparación, no en los números sueltos: si la
 * plataforma dice que vendiste X y al banco entró bastante menos, hay algo
 * que revisar — un cobro que no se hizo, un pago en efectivo que no se
 * depositó, o una reserva mal cargada.
 */
export default function CierreMensualPanel({ d, onCambio }: {
  d: PanelFinanzas
  onCambio: () => void
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const c = d.cierre
  const cerrado = !!c?.cerrado

  const [f, setF] = useState({
    depositos_banco: c?.depositos_banco ?? 0,
    ventas_sii_neto: c?.ventas_sii_neto ?? 0,
    iva_pagado: c?.iva_pagado ?? 0,
    ppm_pagado: c?.ppm_pagado ?? 0,
    retiro_socios: c?.retiro_socios ?? 0,
    notas: c?.notas ?? '',
  })

  function set(k: string, v: string | number) { setF(p => ({ ...p, [k]: v })) }

  const plataforma = d.mes.ventas
  const banco = f.depositos_banco
  const diferencia = banco - plataforma
  const cuadrado = cuadra(plataforma, banco)

  const impuestos = f.iva_pagado + f.ppm_pagado
  const apartadoTeorico = Math.round(plataforma * TASA_APARTAR_IMPUESTOS)
  const utilidadReal = plataforma - d.mes.insumos - d.equilibrio.fijos - impuestos
  const quedaEnEmpresa = utilidadReal - f.retiro_socios

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50 disabled:text-gray-500'
  const etiqueta = 'block text-xs font-medium text-gray-600 mb-1'

  function guardar() {
    setError(null); setOk(null)
    start(async () => {
      const r = await guardarCierre(d.periodo, f)
      if (!r.success) { setError(r.error ?? 'Error'); return }
      setOk('Guardado')
      onCambio()
    })
  }

  return (
    <div className="space-y-5">

      {/* Estado */}
      <div className={cn('rounded-xl border p-4 flex items-start justify-between gap-4',
        cerrado ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white')}>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {cerrado ? `✓ ${d.etiqueta} cerrado` : `${d.etiqueta} abierto`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {cerrado && c?.cerrado_at
              ? `Cerrado el ${new Date(c.cerrado_at).toLocaleDateString('es-CL')}`
              : `El cierre se hace alrededor del día ${DIA_CIERRE} del mes siguiente, cuando ya tienes el F29.`}
          </p>
        </div>

        <button
          disabled={pending}
          className={cn('text-xs px-3 py-1.5 rounded-lg border shrink-0',
            cerrado ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
              : 'border-green-300 bg-green-500 text-white hover:bg-green-600')}
          onClick={() => start(async () => {
            const r = cerrado ? await reabrirMes(d.periodo) : await cerrarMes(d.periodo)
            if (!r.success) { setError(r.error ?? 'Error'); return }
            onCambio()
          })}>
          {cerrado ? 'Reabrir' : 'Cerrar mes'}
        </button>
      </div>

      {/* Cuadratura */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Plataforma contra banco</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <p className={etiqueta}>Según el sistema</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(plataforma)}</p>
            <p className="text-[11px] text-gray-400">{d.mes.autos} trabajos finalizados</p>
          </div>
          <div>
            <label className={etiqueta}>Depositado en el banco</label>
            <input type="number" min={0} step={1000} className={campo} disabled={cerrado}
              value={f.depositos_banco} onChange={e => set('depositos_banco', Number(e.target.value))} />
          </div>
          <div className={cn('rounded-lg p-3 text-center',
            cuadrado ? 'bg-green-50' : 'bg-amber-50')}>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Diferencia</p>
            <p className={cn('font-bold', cuadrado ? 'text-green-700' : 'text-amber-700')}>
              {diferencia === 0 ? '—' : (diferencia > 0 ? '+' : '') + formatCurrency(diferencia)}
            </p>
          </div>
        </div>

        {!cuadrado && banco > 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 leading-relaxed">
            La diferencia supera el 3%. Antes de asumir un error, revisa lo de siempre:
            cobros en efectivo que no se depositaron, un anticipo que entró el mes anterior,
            o una reserva marcada como completada que en realidad se anuló.
          </p>
        )}
      </div>

      {/* SII */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Lo declarado al SII</h3>
        <p className="text-xs text-gray-500 mb-3">Los tres códigos del F29 del mes.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={etiqueta}>Ventas netas · código 563</label>
            <input type="number" min={0} step={1000} className={campo} disabled={cerrado}
              value={f.ventas_sii_neto} onChange={e => set('ventas_sii_neto', Number(e.target.value))} />
          </div>
          <div>
            <label className={etiqueta}>IVA pagado · código 89</label>
            <input type="number" min={0} step={1000} className={campo} disabled={cerrado}
              value={f.iva_pagado} onChange={e => set('iva_pagado', Number(e.target.value))} />
          </div>
          <div>
            <label className={etiqueta}>PPM pagado · código 62</label>
            <input type="number" min={0} step={1000} className={campo} disabled={cerrado}
              value={f.ppm_pagado} onChange={e => set('ppm_pagado', Number(e.target.value))} />
          </div>
        </div>

        <div className="flex justify-between text-xs mt-3 pt-3 border-t border-gray-100">
          <span className="text-gray-500">Total impuestos del mes</span>
          <span className="font-semibold text-gray-900">{formatCurrency(impuestos)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">Lo que habías apartado (12%)</span>
          <span className={cn('font-medium',
            apartadoTeorico >= impuestos ? 'text-green-600' : 'text-red-600')}>
            {formatCurrency(apartadoTeorico)}
            {apartadoTeorico < impuestos && impuestos > 0 && ' · quedó corto'}
          </span>
        </div>
      </div>

      {/* Resultado */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Resultado real del mes</h3>

        <div className="space-y-1.5 text-sm">
          <Linea texto="Ventas" monto={plataforma} />
          <Linea texto="Insumos" monto={-d.mes.insumos} />
          <Linea texto="Costos fijos" monto={-d.equilibrio.fijos} />
          <Linea texto="Impuestos pagados" monto={-impuestos} />
          <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-bold">
            <span className="text-gray-900">Utilidad</span>
            <span className={utilidadReal >= 0 ? 'text-green-700' : 'text-red-700'}>
              {formatCurrency(utilidadReal)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className={etiqueta}>Retiro de los socios</label>
          <input type="number" min={0} step={1000} className={campo} disabled={cerrado}
            value={f.retiro_socios} onChange={e => set('retiro_socios', Number(e.target.value))} />

          <div className={cn('flex justify-between mt-3 p-3 rounded-lg font-bold text-sm',
            quedaEnEmpresa >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>
            <span>Queda en la empresa</span>
            <span>{formatCurrency(quedaEnEmpresa)}</span>
          </div>

          {quedaEnEmpresa < 0 && (
            <p className="text-xs text-red-700 mt-2 leading-relaxed">
              El retiro supera lo que generó el mes. Se está sacando plata que la empresa
              no produjo: sale del colchón o de lo apartado para impuestos.
            </p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className={etiqueta}>Notas del mes</label>
        <textarea rows={3} disabled={cerrado}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50"
          placeholder="Qué explicó un número raro, qué se decidió, qué revisar el próximo mes…"
          value={f.notas} onChange={e => set('notas', e.target.value)} />
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {ok && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">✓ {ok}</div>}

      {!cerrado && (
        <button onClick={guardar} disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? 'Guardando…' : 'Guardar cierre'}
        </button>
      )}
    </div>
  )
}

function Linea({ texto, monto }: { texto: string; monto: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{texto}</span>
      <span className={monto < 0 ? 'text-red-600' : 'text-gray-900'}>
        {monto < 0 ? '-' : ''}{formatCurrency(Math.abs(monto))}
      </span>
    </div>
  )
}
