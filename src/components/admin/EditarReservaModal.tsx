'use client'

import { useState, useEffect, useTransition } from 'react'
import { getServices } from '@/actions/bookings'
import { getReservaParaEditar, actualizarReservaAdmin } from '@/actions/admin'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

const ESTADOS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

interface Props {
  bookingId: string | null
  onClose: () => void
  onSuccess: () => void
}

type Datos = Awaited<ReturnType<typeof getReservaParaEditar>>['data']

export default function EditarReservaModal({ bookingId, onClose, onSuccess }: Props) {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [cargando, setCargando] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [verHistorial, setVerHistorial] = useState(false)

  const [form, setForm] = useState({
    service_id: '', booking_date: '', slot_start: '',
    total_price_clp: 0, customer_notes: '', status: '',
    notificaciones_activas: true,
  })
  const [avisarCliente, setAvisarCliente] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    setCargando(true); setError(null); setAviso(null); setVerHistorial(false)

    Promise.all([
      getReservaParaEditar(bookingId),
      getServices({ incluirPrivadas: true }),
    ]).then(([r, s]) => {
      if (!r.success || !r.data) { setError(r.error ?? 'No se pudo cargar'); setCargando(false); return }
      setDatos(r.data)
      setForm({
        service_id: r.data.service_id,
        booking_date: r.data.booking_date,
        slot_start: r.data.slot_start,
        total_price_clp: r.data.total_price_clp,
        customer_notes: r.data.customer_notes ?? '',
        status: r.data.status,
        notificaciones_activas: r.data.notificaciones_activas,
      })
      if (s.success && s.data) setServices(s.data)
      setCargando(false)
    })
  }, [bookingId])

  function set(k: string, v: string | number | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const servicioActual = services.find(s => s.id === form.service_id)
  const cambioServicio = !!datos && form.service_id !== datos.service_id
  const cambioFechaHora = !!datos &&
    (form.booking_date !== datos.booking_date || form.slot_start !== datos.slot_start)

  const hayCambios = !!datos && (
    cambioServicio || cambioFechaHora ||
    form.total_price_clp !== datos.total_price_clp ||
    (form.customer_notes || '') !== (datos.customer_notes ?? '') ||
    form.status !== datos.status ||
    form.notificaciones_activas !== datos.notificaciones_activas
  )

  function guardar() {
    if (!bookingId || !hayCambios) return
    setError(null); setAviso(null)

    startTransition(async () => {
      const r = await actualizarReservaAdmin(
        bookingId,
        {
          service_id: form.service_id,
          booking_date: form.booking_date,
          slot_start: form.slot_start,
          total_price_clp: form.total_price_clp,
          customer_notes: form.customer_notes || null,
          status: form.status,
          notificaciones_activas: form.notificaciones_activas,
        },
        avisarCliente
      )

      if (!r.success) { setError(r.error ?? 'No se pudo guardar'); return }
      if (r.data?.aviso) { setAviso(r.data.aviso); onSuccess(); return }
      onSuccess(); onClose()
    })
  }

  if (!bookingId) return null

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const etiqueta = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">Editar reserva</h2>
            {datos && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {datos.customer_name} · {datos.vehiculo || 'sin vehículo'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light shrink-0 ml-3">✕</button>
        </div>

        {cargando && <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>}

        {!cargando && datos && (
          <div className="p-5 space-y-4">

            {datos.tiene_certificado && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                Esta reserva ya tiene un certificado emitido. Si cambias el servicio,
                el certificado quedará desactualizado y hay que volver a emitirlo.
              </div>
            )}

            <div>
              <label className={etiqueta}>Servicio</label>
              <select className={campo} value={form.service_id}
                onChange={e => set('service_id', e.target.value)}>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {cambioServicio && !datos.precio_manual && (
                <p className="text-[11px] text-gray-500 mt-1">
                  El precio se recalculará según la tarifa del servicio nuevo.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={etiqueta}>Fecha</label>
                <input type="date" className={campo} value={form.booking_date}
                  onChange={e => set('booking_date', e.target.value)} />
              </div>
              <div>
                <label className={etiqueta}>Hora</label>
                <input type="time" className={campo} value={form.slot_start}
                  onChange={e => set('slot_start', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={etiqueta}>
                Precio
                {datos.precio_manual && (
                  <span className="ml-1.5 text-amber-600 font-normal">· fijado a mano</span>
                )}
              </label>
              <input type="number" min={0} step={1000} className={campo}
                value={form.total_price_clp}
                onChange={e => set('total_price_clp', Number(e.target.value))} />
              <p className="text-[11px] text-gray-500 mt-1">
                {formatCurrency(form.total_price_clp)}
                {form.total_price_clp !== datos.total_price_clp &&
                  ' · quedará marcado como precio manual'}
              </p>
            </div>

            <div>
              <label className={etiqueta}>Estado</label>
              <select className={campo} value={form.status}
                onChange={e => set('status', e.target.value)}>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div>
              <label className={etiqueta}>Notas</label>
              <textarea className={`${campo} resize-none`} rows={2} value={form.customer_notes}
                onChange={e => set('customer_notes', e.target.value)} />
            </div>

            {/* Control de avisos */}
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label className="flex items-start gap-2.5 p-3 cursor-pointer">
                <input type="checkbox" checked={form.notificaciones_activas}
                  onChange={e => set('notificaciones_activas', e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-500" />
                <span className="text-sm text-gray-700">
                  Avisos automáticos activados
                  <span className="block text-[11px] text-gray-400 leading-relaxed">
                    Al desactivarlo, esta reserva deja de generar recordatorios,
                    certificado y solicitud de reseña.
                  </span>
                </span>
              </label>

              <label className={cn(
                'flex items-start gap-2.5 p-3',
                form.notificaciones_activas ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              )}>
                <input type="checkbox" checked={avisarCliente}
                  disabled={!form.notificaciones_activas}
                  onChange={e => setAvisarCliente(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-500" />
                <span className="text-sm text-gray-700">
                  Avisar al cliente de este cambio
                  <span className="block text-[11px] text-gray-400 leading-relaxed">
                    Le llega un WhatsApp con el servicio, la fecha y la hora actualizados.
                  </span>
                </span>
              </label>
            </div>

            {/* Historial */}
            {datos.cambios.length > 0 && (
              <div>
                <button type="button" onClick={() => setVerHistorial(v => !v)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline">
                  {verHistorial ? 'Ocultar' : 'Ver'} historial de cambios ({datos.cambios.length})
                </button>
                {verHistorial && (
                  <ul className="mt-2 space-y-1.5 text-[11px] text-gray-500 border-l-2 border-gray-200 pl-3">
                    {datos.cambios.map((c, i) => (
                      <li key={i}>
                        <span className="font-medium text-gray-700">{c.campo}</span>
                        {': '}{c.valor_antes} → {c.valor_luego}
                        <span className="block text-gray-400">
                          {new Date(c.created_at).toLocaleString('es-CL', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}
            {aviso && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{aviso}</div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                {aviso ? 'Cerrar' : 'Cancelar'}
              </button>
              <button type="button" onClick={guardar} disabled={!hayCambios || pending}
                className="btn-primary flex-1 disabled:opacity-50">
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {!cargando && !datos && error && (
          <div className="p-5">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            <button onClick={onClose} className="btn-secondary w-full mt-4">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}
