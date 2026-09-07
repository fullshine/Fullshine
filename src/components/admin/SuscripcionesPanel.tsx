'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  getSuscripciones, crearSuscripcion, actualizarSuscripcion, eliminarSuscripcion,
  getDetalle, registrarLavado, eliminarLavado,
  registrarExtra, marcarExtraPagado, eliminarExtra,
  agregarVehiculo, eliminarVehiculo,
} from '@/actions/suscripciones'
import type { Vehiculo } from '@/actions/suscripciones'
import { LAVADOS_POR_FRECUENCIA, ETIQUETA_FRECUENCIA, agruparPorMes } from '@/lib/suscripciones'
import type { Frecuencia } from '@/lib/suscripciones'
import { cn, formatCurrency } from '@/lib/utils'

type Lista = Awaited<ReturnType<typeof getSuscripciones>>['data']
type Detalle = Awaited<ReturnType<typeof getDetalle>>['data']

const SITIO = 'https://www.fullshine.autos'
const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
const etiqueta = 'block text-xs font-medium text-gray-600 mb-1'

function hoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

export default function SuscripcionesPanel() {
  const [lista, setLista] = useState<Lista>([])
  const [cargando, setCargando] = useState(true)
  const [abierta, setAbierta] = useState<string | null>(null)
  const [nuevaVisible, setNuevaVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function recargar() {
    const r = await getSuscripciones()
    if (r.success) setLista(r.data ?? [])
    else setError(r.error ?? null)
    setCargando(false)
  }

  useEffect(() => { recargar() }, [])

  const activas = (lista ?? []).filter(s => s.activa)
  const ingresoAnual = activas.reduce((s, x) => s + x.monto_clp, 0)
  const extrasMes = (lista ?? []).reduce((s, x) => s + x.extras_mes, 0)

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <Tarjeta titulo="Suscripciones activas" valor={String(activas.length)} />
        <Tarjeta titulo="Cobrado en anualidades" valor={formatCurrency(ingresoAnual)} />
        <Tarjeta titulo="Adicionales este mes" valor={formatCurrency(extrasMes)} />
      </div>

      <div className="flex justify-between items-center gap-3">
        <h2 className="font-bold text-gray-900">Clientes</h2>
        <button onClick={() => setNuevaVisible(v => !v)} className="btn-primary text-sm">
          {nuevaVisible ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {nuevaVisible && (
        <FormularioNueva onListo={() => { setNuevaVisible(false); recargar() }} />
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {cargando && <p className="text-sm text-gray-500">Cargando…</p>}

      {!cargando && (lista ?? []).length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 text-sm">
          Todavía no hay clientes con suscripción.
        </div>
      )}

      <div className="space-y-3">
        {(lista ?? []).map(s => (
          <Fila key={s.id} s={s}
            abierta={abierta === s.id}
            onToggle={() => setAbierta(abierta === s.id ? null : s.id)}
            onCambio={recargar} />
        ))}
      </div>
    </div>
  )
}

function Tarjeta({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{titulo}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{valor}</p>
    </div>
  )
}

// ── Alta de cliente ─────────────────────────────────────────────────────

function FormularioNueva({ onListo }: { onListo: () => void }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [creada, setCreada] = useState<{ slug: string; codigo: string } | null>(null)
  const [f, setF] = useState({
    nombre: '', telefono: '', email: '', vehiculo: '', patente: '',
    frecuencia: 'mensual' as Frecuencia,
    lavados_totales: 12, lavados_previos: 0, monto_clp: 0, inicio: hoy(), notas: '',
  })

  function set(k: string, v: string | number) { setF(p => ({ ...p, [k]: v })) }

  function cambiarFrecuencia(fr: Frecuencia) {
    setF(p => ({ ...p, frecuencia: fr, lavados_totales: LAVADOS_POR_FRECUENCIA[fr] }))
  }

  if (creada) {
    const url = `${SITIO}/suscripcion/${creada.slug}`
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
        <p className="font-semibold text-green-900 text-sm">Cliente creado</p>
        <div className="text-sm text-gray-700 space-y-1">
          <p><span className="text-gray-500">Enlace:</span> <code className="bg-white px-1.5 py-0.5 rounded border text-xs">{url}</code></p>
          <p><span className="text-gray-500">Código:</span> <code className="bg-white px-1.5 py-0.5 rounded border font-bold">{creada.codigo}</code></p>
        </div>
        <p className="text-xs text-gray-500">
          Mándale los dos por WhatsApp. El código queda guardado 90 días en su teléfono.
        </p>
        <button onClick={onListo} className="btn-primary text-sm">Listo</button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiqueta}>Nombre *</label>
          <input className={campo} value={f.nombre} onChange={e => set('nombre', e.target.value)} />
        </div>
        <div>
          <label className={etiqueta}>Teléfono</label>
          <input className={campo} value={f.telefono} onChange={e => set('telefono', e.target.value)} placeholder="9 1234 5678" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiqueta}>Vehículo</label>
          <input className={campo} value={f.vehiculo} onChange={e => set('vehiculo', e.target.value)} placeholder="Toyota Corolla" />
        </div>
        <div>
          <label className={etiqueta}>Patente</label>
          <input className={`${campo} uppercase`} value={f.patente}
            onChange={e => set('patente', e.target.value.toUpperCase())} />
        </div>
      </div>

      <div>
        <label className={etiqueta}>Plan</label>
        <div className="grid grid-cols-2 gap-3">
          {(['semanal', 'mensual'] as Frecuencia[]).map(fr => (
            <button key={fr} type="button" onClick={() => cambiarFrecuencia(fr)}
              className={cn(
                'py-2 px-3 rounded-lg border text-xs font-medium transition-colors',
                f.frecuencia === fr
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
              )}>
              {ETIQUETA_FRECUENCIA[fr]}
              <span className="block font-normal opacity-75">{LAVADOS_POR_FRECUENCIA[fr]} al año</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={etiqueta}>Lavados del plan</label>
          <input type="number" min={1} className={campo} value={f.lavados_totales}
            onChange={e => set('lavados_totales', Number(e.target.value))} />
        </div>
        <div>
          <label className={etiqueta}>Monto anual</label>
          <input type="number" min={0} step={1000} className={campo} value={f.monto_clp}
            onChange={e => set('monto_clp', Number(e.target.value))} />
        </div>
        <div>
          <label className={etiqueta}>Inicio</label>
          <input type="date" className={campo} value={f.inicio} onChange={e => set('inicio', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={etiqueta}>Lavados que ya se hizo</label>
        <input type="number" min={0} className={`${campo} w-32`} value={f.lavados_previos}
          onChange={e => set('lavados_previos', Math.max(0, Number(e.target.value)))} />
        <p className="text-[11px] text-gray-500 mt-1">
          Para clientes que venían de antes. Se suma al contador sin tener que
          cargar cada lavado uno por uno. Déjalo en 0 si parte de cero.
        </p>
      </div>

      <p className="text-[11px] text-gray-500">
        El plan vence un año exacto después del inicio.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={pending || !f.nombre.trim()} className="btn-primary text-sm disabled:opacity-50"
        onClick={() => start(async () => {
          setError(null)
          const r = await crearSuscripcion(f)
          if (!r.success) { setError(r.error ?? 'Error'); return }
          setCreada(r.data!)
        })}>
        {pending ? 'Creando…' : 'Crear suscripción'}
      </button>
    </div>
  )
}

// ── Fila con detalle desplegable ────────────────────────────────────────

function Fila({ s, abierta, onToggle, onCambio }: {
  s: NonNullable<Lista>[number]
  abierta: boolean
  onToggle: () => void
  onCambio: () => void
}) {
  const [detalle, setDetalle] = useState<Detalle | null>(null)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  async function cargar() {
    const r = await getDetalle(s.id)
    if (r.success) setDetalle(r.data!)
  }

  useEffect(() => { if (abierta) cargar() }, [abierta]) // eslint-disable-line

  const a = s.avance
  const color = a.vencida ? 'bg-gray-300'
    : a.diferencia >= 2 ? 'bg-amber-400'
    : a.disponibles === 0 ? 'bg-red-400'
    : 'bg-emerald-400'

  return (
    <div className={cn('rounded-xl border bg-white', s.activa ? 'border-gray-200' : 'border-gray-200 opacity-60')}>
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {s.nombre}
              {!s.activa && <span className="ml-2 text-xs font-normal text-gray-400">inactiva</span>}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {ETIQUETA_FRECUENCIA[s.frecuencia]}
              {s.vehiculos.length > 0 && ' · ' + s.vehiculos
                .map(v => v.descripcion + (v.patente ? ` (${v.patente})` : ''))
                .join(' · ')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-gray-900">{s.realizados}<span className="text-gray-400 font-normal">/{s.lavados_totales}</span></p>
            <p className="text-[11px] text-gray-400">lavados</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${a.progreso}%` }} />
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5">{a.mensaje}</p>
      </button>

      {abierta && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Acceso */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <p className="text-gray-500">Enlace del cliente</p>
            <code className="block bg-white px-2 py-1 rounded border break-all">{SITIO}/suscripcion/{s.slug}</code>
            <p className="text-gray-500 mt-1.5">Código: <code className="bg-white px-1.5 py-0.5 rounded border font-bold">{s.access_code}</code></p>
          </div>

          {msg && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">{msg}</p>}

          {/* Vehículos */}
          <Vehiculos subId={s.id} vehiculos={s.vehiculos}
            onCambio={() => { cargar(); onCambio() }} />

          {/* Contador manual */}
          <ContadorManual s={s} onCambio={onCambio} />

          {/* Registrar lavado */}
          <RegistrarLavado subId={s.id} vehiculos={s.vehiculos}
            onListo={() => { cargar(); onCambio() }} onAviso={setMsg} />

          {/* Servicio adicional */}
          <RegistrarExtra subId={s.id} onListo={() => { cargar(); onCambio() }} />

          {detalle && (
            <>
              <Historial titulo="Lavados del plan"
                vacio="Todavía no hay lavados registrados."
                grupos={agruparPorMes(detalle.lavados)}
                render={(l: any) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                    <span className="text-gray-700 min-w-0 truncate">
                      {l.fecha}
                      {s.vehiculos.length > 1 && l.vehicle_id && (
                        <span className="text-gray-500 ml-2">
                          {s.vehiculos.find(v => v.id === l.vehicle_id)?.descripcion ?? ''}
                        </span>
                      )}
                      {l.detalle && <span className="text-gray-400 ml-2">{l.detalle}</span>}
                    </span>
                    <button className="text-xs text-red-500 hover:underline"
                      onClick={() => start(async () => {
                        await eliminarLavado(l.id); cargar(); onCambio()
                      })}>
                      quitar
                    </button>
                  </div>
                )} />

              <Historial titulo="Servicios adicionales"
                vacio="Sin servicios fuera del plan."
                grupos={agruparPorMes(detalle.extras)}
                totalPorGrupo={(items: any[]) => items.reduce((t, x) => t + x.precio_clp, 0)}
                render={(e: any) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                    <span className="text-gray-700 min-w-0 truncate">
                      {e.fecha} · {e.descripcion}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-medium">{formatCurrency(e.precio_clp)}</span>
                      <button
                        className={cn('text-[11px] px-1.5 py-0.5 rounded border',
                          e.pagado ? 'bg-green-50 border-green-200 text-green-700'
                                   : 'bg-amber-50 border-amber-200 text-amber-700')}
                        onClick={() => start(async () => {
                          await marcarExtraPagado(e.id, !e.pagado); cargar(); onCambio()
                        })}>
                        {e.pagado ? 'pagado' : 'por cobrar'}
                      </button>
                      <button className="text-xs text-red-500 hover:underline"
                        onClick={() => start(async () => {
                          await eliminarExtra(e.id); cargar(); onCambio()
                        })}>
                        ✕
                      </button>
                    </span>
                  </div>
                )} />
            </>
          )}

          {/* Acciones sobre la suscripción */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={pending}
              onClick={() => start(async () => {
                await actualizarSuscripcion(s.id, { activa: !s.activa }); onCambio()
              })}>
              {s.activa ? 'Marcar inactiva' : 'Reactivar'}
            </button>
            <button className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 ml-auto"
              disabled={pending}
              onClick={() => start(async () => {
                if (!confirm(`¿Eliminar la suscripción de ${s.nombre}? Se borran también sus lavados y adicionales.`)) return
                await eliminarSuscripcion(s.id); onCambio()
              })}>
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Autos del cliente. El plan es uno solo y los lavados se descuentan del
 *  mismo cupo, sin importar cuál de los vehículos se haya lavado. */
function Vehiculos({ subId, vehiculos, onCambio }: {
  subId: string
  vehiculos: Vehiculo[]
  onCambio: () => void
}) {
  const [pending, start] = useTransition()
  const [abierto, setAbierto] = useState(false)
  const [f, setF] = useState({ descripcion: '', patente: '' })

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-700">
          Vehículos {vehiculos.length > 0 && <span className="text-gray-400 font-normal">({vehiculos.length})</span>}
        </p>
        <button className="text-xs text-brand-600 hover:underline"
          onClick={() => setAbierto(a => !a)}>
          {abierto ? 'Cancelar' : '+ Agregar otro'}
        </button>
      </div>

      {vehiculos.length === 0 && !abierto && (
        <p className="text-xs text-gray-400">Sin vehículos registrados.</p>
      )}

      {vehiculos.length > 0 && (
        <div className="divide-y divide-gray-100">
          {vehiculos.map(v => (
            <div key={v.id} className="flex items-center justify-between gap-2 py-1.5">
              <span className="text-sm text-gray-700 min-w-0 truncate">
                🚗 {v.descripcion}
                {v.patente && <span className="text-gray-400 ml-1.5">{v.patente}</span>}
              </span>
              <button className="text-xs text-red-500 hover:underline shrink-0"
                disabled={pending}
                onClick={() => start(async () => {
                  if (!confirm(`¿Quitar ${v.descripcion} del plan? Los lavados ya registrados se mantienen.`)) return
                  await eliminarVehiculo(v.id)
                  onCambio()
                })}>
                quitar
              </button>
            </div>
          ))}
        </div>
      )}

      {abierto && (
        <div className="flex gap-2 mt-2">
          <input className={campo} placeholder="Marca y modelo" value={f.descripcion}
            onChange={e => setF(p => ({ ...p, descripcion: e.target.value }))} />
          <input className={`${campo} w-28 uppercase`} placeholder="Patente" value={f.patente}
            onChange={e => setF(p => ({ ...p, patente: e.target.value.toUpperCase() }))} />
          <button className="btn-primary text-sm px-4 shrink-0"
            disabled={pending || !f.descripcion.trim()}
            onClick={() => start(async () => {
              await agregarVehiculo({ subscription_id: subId, ...f })
              setF({ descripcion: '', patente: '' })
              setAbierto(false)
              onCambio()
            })}>
            {pending ? '…' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Ajuste directo del contador.
 *
 * Los lavados con fecha siguen siendo la fuente principal; esto solo mueve el
 * arrastre. Se muestra el desglose para que quede claro de dónde sale el total
 * y no parezca que el número se inventó solo.
 */
function ContadorManual({ s, onCambio }: {
  s: NonNullable<Lista>[number]
  onCambio: () => void
}) {
  const [pending, start] = useTransition()
  const previos = s.lavados_previos ?? 0
  const conFecha = s.realizados - previos
  const [valor, setValor] = useState(previos)

  useEffect(() => { setValor(previos) }, [previos])

  const cambiado = valor !== previos

  function guardar(nuevo: number) {
    const v = Math.max(0, nuevo)
    setValor(v)
    start(async () => {
      await actualizarSuscripcion(s.id, { lavados_previos: v })
      onCambio()
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2">Contador de lavados</p>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          disabled={pending || valor === 0} onClick={() => guardar(valor - 1)}>
          −
        </button>

        <input type="number" min={0} value={valor}
          onChange={e => setValor(Math.max(0, Number(e.target.value)))}
          className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center" />

        <button className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          disabled={pending} onClick={() => guardar(valor + 1)}>
          +
        </button>

        {cambiado && (
          <button className="btn-primary text-xs px-3 py-1.5" disabled={pending}
            onClick={() => guardar(valor)}>
            Guardar
          </button>
        )}

        <span className="text-xs text-gray-500 ml-auto text-right">
          Total usado: <strong className="text-gray-900">{previos + conFecha}</strong> de {s.lavados_totales}
        </span>
      </div>

      <p className="text-[11px] text-gray-500 mt-2">
        {previos} cargados a mano
        {conFecha > 0 && ` + ${conFecha} con fecha registrada`}.
        Usa este contador para clientes que venían de antes o para corregir el total sin
        tener que anotar cada lavado.
      </p>
    </div>
  )
}

function RegistrarLavado({ subId, vehiculos, onListo, onAviso }: {
  subId: string
  vehiculos: Vehiculo[]
  onListo: () => void
  onAviso: (m: string | null) => void
}) {
  const [pending, start] = useTransition()
  const [fecha, setFecha] = useState(hoy())
  const [detalle, setDetalle] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')

  // Con un solo auto no hay nada que elegir: se asigna solo.
  const auto = vehiculos.length === 1 ? vehiculos[0].id : vehiculoId

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2">Registrar lavado del plan</p>

      {vehiculos.length > 1 && (
        <select className={`${campo} mb-2`} value={vehiculoId}
          onChange={e => setVehiculoId(e.target.value)}>
          <option value="">¿Qué vehículo? (opcional)</option>
          {vehiculos.map(v => (
            <option key={v.id} value={v.id}>
              {v.descripcion}{v.patente ? ` · ${v.patente}` : ''}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <input type="date" className={`${campo} w-auto`} value={fecha} onChange={e => setFecha(e.target.value)} />
        <input className={campo} placeholder="Nota opcional" value={detalle} onChange={e => setDetalle(e.target.value)} />
        <button className="btn-primary text-sm px-4 shrink-0" disabled={pending}
          onClick={() => start(async () => {
            onAviso(null)
            const r = await registrarLavado({
              subscription_id: subId, fecha, detalle, vehicle_id: auto || null,
            })
            if (r.error) onAviso(r.error)
            setDetalle('')
            setVehiculoId('')
            onListo()
          })}>
          {pending ? '…' : 'Marcar'}
        </button>
      </div>
    </div>
  )
}

function RegistrarExtra({ subId, onListo }: { subId: string; onListo: () => void }) {
  const [pending, start] = useTransition()
  const [f, setF] = useState({ fecha: hoy(), descripcion: '', precio_clp: 0 })

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2">Servicio adicional del mes</p>
      <div className="flex gap-2">
        <input type="date" className={`${campo} w-auto`} value={f.fecha}
          onChange={e => setF(p => ({ ...p, fecha: e.target.value }))} />
        <input className={campo} placeholder="Pulido, tapiz, cerámico…" value={f.descripcion}
          onChange={e => setF(p => ({ ...p, descripcion: e.target.value }))} />
        <input type="number" min={0} step={1000} className={`${campo} w-28`} value={f.precio_clp}
          onChange={e => setF(p => ({ ...p, precio_clp: Number(e.target.value) }))} />
        <button className="btn-primary text-sm px-4 shrink-0"
          disabled={pending || !f.descripcion.trim()}
          onClick={() => start(async () => {
            await registrarExtra({ subscription_id: subId, ...f })
            setF({ fecha: hoy(), descripcion: '', precio_clp: 0 })
            onListo()
          })}>
          {pending ? '…' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}

function Historial({ titulo, vacio, grupos, render, totalPorGrupo }: {
  titulo: string
  vacio: string
  grupos: { mes: string; etiqueta: string; items: any[] }[]
  render: (item: any) => React.ReactNode
  totalPorGrupo?: (items: any[]) => number
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-1.5">{titulo}</p>
      {grupos.length === 0 ? (
        <p className="text-xs text-gray-400">{vacio}</p>
      ) : (
        <div className="space-y-2">
          {grupos.map(g => (
            <div key={g.mes}>
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 capitalize">{g.etiqueta}</p>
                <p className="text-[11px] text-gray-500">
                  {totalPorGrupo ? formatCurrency(totalPorGrupo(g.items)) : `${g.items.length}`}
                </p>
              </div>
              <div className="divide-y divide-gray-100">{g.items.map(render)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
