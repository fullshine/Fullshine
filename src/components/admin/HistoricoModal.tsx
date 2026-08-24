'use client'

import { useState, useEffect, useTransition } from 'react'
import { getServices } from '@/actions/bookings'
import { cargarTrabajoHistorico } from '@/actions/mantenciones'
import type { Service } from '@/types'

const TIPOS = [
  { value: 'hatch_sedan',   label: 'Hatch / Sedan' },
  { value: 'suv_camioneta', label: 'SUV / Camioneta' },
  { value: 'pickup_xl',     label: 'Pickup XL' },
]

const VACIO = {
  full_name: '', phone: '',
  vehicle_make: '', vehicle_model: '', vehicle_plate: '',
  vehicle_year: '', vehicle_type: 'hatch_sedan',
  service_id: '', fecha: '', total_price: '', notes: '',
}

/**
 * Carga de trabajos YA REALIZADOS, anteriores al sistema actual.
 * Entran directo como completados y NO envían ningún WhatsApp al cliente.
 */
export default function HistoricoModal({
  open, onClose, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState(VACIO)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargados, setCargados] = useState(0)

  useEffect(() => {
    if (!open) return
    getServices({ incluirPrivadas: true }).then(r => {
      if (r.success && r.data) setServices(r.data.filter(s => s.is_active))
    })
    setForm(VACIO); setMsg(null); setError(null); setCargados(0)
  }, [open])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  const servicioSel = services.find(s => s.id === form.service_id)
  const esCeramico =
    String(servicioSel?.category ?? '') === 'ceramico' ||
    /cer[áa]mico/i.test(servicioSel?.name ?? '')

  const listo =
    form.full_name.trim() && form.phone.trim() &&
    form.vehicle_make.trim() && form.vehicle_model.trim() &&
    form.service_id && form.fecha

  function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!listo) return
    setError(null); setMsg(null)

    startTransition(async () => {
      const r = await cargarTrabajoHistorico({
        full_name:     form.full_name.trim(),
        phone:         form.phone.trim(),
        vehicle_make:  form.vehicle_make.trim(),
        vehicle_model: form.vehicle_model.trim(),
        vehicle_plate: form.vehicle_plate.trim() || undefined,
        vehicle_year:  form.vehicle_year ? parseInt(form.vehicle_year) : undefined,
        vehicle_type:  form.vehicle_type,
        service_id:    form.service_id,
        fecha:         form.fecha,
        total_price:   form.total_price ? parseInt(form.total_price) : undefined,
        notes:         form.notes.trim() || undefined,
      })

      if (!r.success) { setError(r.error ?? 'Error al guardar'); return }

      setCargados(n => n + 1)
      setMsg(
        esCeramico
          ? '✅ Guardado. Se programó su mantención a 6 meses.'
          : '✅ Guardado.'
      )
      // Conserva el servicio y la fecha para cargar varios seguidos
      setForm(f => ({
        ...VACIO,
        service_id: f.service_id,
        fecha: f.fecha,
        vehicle_type: f.vehicle_type,
      }))
      onSuccess()
    })
  }

  if (!open) return null

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cargar trabajo histórico</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Clientes atendidos antes de este sistema. Entra como completado y{' '}
              <strong>no se le envía ningún mensaje</strong>.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <form onSubmit={guardar} className="p-5 space-y-4">
          {cargados > 0 && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              {cargados} {cargados === 1 ? 'trabajo cargado' : 'trabajos cargados'} en esta sesión.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input className="input-field" value={form.full_name}
                onChange={e => set('full_name', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
              <input className="input-field" value={form.phone} type="tel"
                onChange={e => set('phone', e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <input className="input-field" value={form.vehicle_make}
                onChange={e => set('vehicle_make', e.target.value)} placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input className="input-field" value={form.vehicle_model}
                onChange={e => set('vehicle_model', e.target.value)} placeholder="Corolla" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
              <input className="input-field" value={form.vehicle_plate}
                onChange={e => set('vehicle_plate', e.target.value.toUpperCase())} placeholder="ABCD12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input className="input-field" value={form.vehicle_year} type="number"
                onChange={e => set('vehicle_year', e.target.value)} placeholder="2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select className="input-field" value={form.vehicle_type}
                onChange={e => set('vehicle_type', e.target.value)}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio realizado *</label>
            <select className="input-field" value={form.service_id}
              onChange={e => set('service_id', e.target.value)}>
              <option value="">Selecciona…</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {esCeramico && (
              <p className="text-xs text-green-700 mt-1.5 font-medium">
                💎 Al ser cerámico, se programará su mantención automáticamente a 6 meses.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del trabajo *</label>
              <input className="input-field" type="date" max={hoy} value={form.fecha}
                onChange={e => set('fecha', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio cobrado <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input className="input-field" type="number" value={form.total_price}
                onChange={e => set('total_price', e.target.value)} placeholder="350000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="Producto usado, observaciones…" />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {msg && !error && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
            <button type="submit" disabled={!listo || pending} className="btn-primary flex-1 disabled:opacity-50">
              {pending ? 'Guardando…' : 'Guardar y cargar otro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
