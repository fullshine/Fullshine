'use client'

import { useState, useEffect, useTransition } from 'react'
import { getServices } from '@/actions/bookings'
import { crearReservaAdmin } from '@/actions/admin'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service, VehicleType } from '@/types'

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'hatch_sedan', label: 'Hatch / Sedan' },
  { value: 'suv_camioneta', label: 'SUV / Camioneta' },
  { value: 'pickup_xl', label: 'Pickup XL' },
]

const CATEGORIAS: Record<string, string> = {
  revision: 'Revisión y diagnóstico',
  lavado_detallado: 'Lavado detallado',
  tapiz: 'Tapiz',
  pulido: 'Pulidos',
  ceramico: 'Tratamiento cerámico',
  mantencion: 'Mantención',
  adicional: 'Adicionales',
  precompra: 'Precompra',
  automotora: 'Convenio automotora',
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const VACIO = {
  full_name: '', phone: '', email: '',
  vehicle_make: '', vehicle_model: '', vehicle_plate: '',
  vehicle_type: 'hatch_sedan' as VehicleType,
  fecha: '', hora: '09:00', notas: '',
}

export default function ManualBookingModal({ open, onClose, onSuccess }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState(VACIO)
  const [seleccion, setSeleccion] = useState<string[]>([])
  const [avisar, setAvisar] = useState(true)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getServices({ incluirPrivadas: true }).then(r => {
      if (r.success && r.data) setServices(r.data.filter(s => s.is_active))
    })
    setForm({ ...VACIO, fecha: new Date().toISOString().split('T')[0] })
    setSeleccion([])
    setError(null)
    setOk(null)
  }, [open])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function toggle(id: string) {
    setSeleccion(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const elegidos = seleccion
    .map(id => services.find(s => s.id === id))
    .filter(Boolean) as Service[]

  const totalEstimado = elegidos.reduce((sum, s) => {
    const p = s.prices?.find(x => x.vehicle_type === form.vehicle_type)?.price_clp ?? 0
    return sum + p
  }, 0)

  const horasTotales = elegidos.reduce(
    (sum, s) => sum + ((s as any).duration_hours ?? 1), 0
  )

  const soloDigitos = form.phone.replace(/\D/g, '')
  const telefonoValido = soloDigitos.length === 9 || soloDigitos.length === 11

  const listo =
    form.full_name.trim() && telefonoValido &&
    form.vehicle_make.trim() && form.vehicle_model.trim() &&
    seleccion.length > 0 && form.fecha && form.hora

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!listo) return
    setError(null); setOk(null)

    startTransition(async () => {
      const r = await crearReservaAdmin({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || undefined,
        vehicle_make: form.vehicle_make,
        vehicle_model: form.vehicle_model,
        vehicle_plate: form.vehicle_plate || undefined,
        vehicle_type: form.vehicle_type,
        service_ids: seleccion,
        fecha: form.fecha,
        hora: form.hora,
        notas: form.notas || undefined,
        avisar,
      })

      if (!r.success) { setError(r.error ?? 'Error al crear la reserva'); return }
      setOk(`${r.data?.creadas ?? 0} reserva(s) creada(s)`)
      setTimeout(() => { onSuccess(); onClose() }, 1000)
    })
  }

  if (!open) return null

  const campo = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const etiqueta = 'block text-xs font-medium text-gray-600 mb-1'

  // Agrupar servicios por categoría
  const grupos = services.reduce<Record<string, Service[]>>((acc, s) => {
    const c = s.category ?? 'adicional'
    if (!acc[c]) acc[c] = []
    acc[c].push(s)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nueva reserva manual</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Horario libre y varios servicios. Sin validación de disponibilidad.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {/* Cliente */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">1 · Cliente</h3>
            <div className="space-y-3">
              <div>
                <label className={etiqueta}>Nombre completo *</label>
                <input className={campo} value={form.full_name}
                  onChange={e => set('full_name', e.target.value)} placeholder="Juan Pérez" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={etiqueta}>Teléfono *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="9 1234 5678" required
                    className={cn(campo, form.phone && !telefonoValido && 'border-red-400 focus:ring-red-300')} />
                  {form.phone && !telefonoValido && (
                    <p className="text-[11px] text-red-500 mt-1">Debe tener 9 dígitos</p>
                  )}
                </div>
                <div>
                  <label className={etiqueta}>Email <span className="text-gray-400">(opcional)</span></label>
                  <input type="email" className={campo} value={form.email}
                    onChange={e => set('email', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Vehículo */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">2 · Vehículo</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {VEHICLE_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('vehicle_type', t.value)}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-xs font-medium transition-colors',
                    form.vehicle_type === t.value
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={etiqueta}>Marca *</label>
                <input className={campo} value={form.vehicle_make}
                  onChange={e => set('vehicle_make', e.target.value)} placeholder="Toyota" required />
              </div>
              <div>
                <label className={etiqueta}>Modelo *</label>
                <input className={campo} value={form.vehicle_model}
                  onChange={e => set('vehicle_model', e.target.value)} placeholder="Corolla" required />
              </div>
              <div>
                <label className={etiqueta}>Patente</label>
                <input className={`${campo} uppercase`} value={form.vehicle_plate}
                  onChange={e => set('vehicle_plate', e.target.value.toUpperCase())} placeholder="ABCD12" />
              </div>
            </div>
          </section>

          {/* Servicios — selección múltiple */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              3 · Servicios <span className="font-normal text-gray-400">(puedes elegir varios)</span>
            </h3>
            {seleccion.length > 0 && (
              <p className="text-xs text-brand-600 font-medium mb-2">
                {seleccion.length} seleccionado{seleccion.length > 1 ? 's' : ''} ·
                {' '}{horasTotales}h aprox. · {formatCurrency(totalEstimado)}
              </p>
            )}

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {Object.entries(grupos).map(([cat, items]) => (
                <div key={cat}>
                  <p className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 sticky top-0">
                    {CATEGORIAS[cat] ?? cat}
                  </p>
                  {items.map(s => {
                    const activo = seleccion.includes(s.id)
                    const precio = s.prices?.find(p => p.vehicle_type === form.vehicle_type)?.price_clp
                    return (
                      <button key={s.id} type="button" onClick={() => toggle(s.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                          activo ? 'bg-brand-50' : 'hover:bg-gray-50'
                        )}>
                        <span className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0',
                          activo ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'
                        )}>
                          {activo && '✓'}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-gray-900 truncate">{s.name}</span>
                          <span className="block text-[11px] text-gray-400">
                            {(s as any).duration_hours ?? 1}h
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-gray-600 shrink-0">
                          {precio === 0 ? 'Gratis' : precio ? formatCurrency(precio) : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Fecha y hora libres */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">4 · Fecha y hora</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={etiqueta}>Fecha *</label>
                <input type="date" className={campo} value={form.fecha}
                  onChange={e => set('fecha', e.target.value)} required />
              </div>
              <div>
                <label className={etiqueta}>Hora de inicio *</label>
                <input type="time" className={campo} value={form.hora}
                  onChange={e => set('hora', e.target.value)} required />
              </div>
            </div>
            {elegidos.length > 1 && (
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Los servicios se encadenan a partir de esa hora, uno después del otro.
                Se crea una tarjeta por servicio en el CRM.
              </p>
            )}
          </section>

          {/* Notas y aviso */}
          <section className="space-y-3">
            <div>
              <label className={etiqueta}>Notas <span className="text-gray-400">(opcional)</span></label>
              <textarea className={`${campo} resize-none`} rows={2} value={form.notas}
                onChange={e => set('notas', e.target.value)} />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={avisar} onChange={e => setAvisar(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-500" />
              <span className="text-sm text-gray-700">
                Avisar al cliente por WhatsApp
                <span className="block text-[11px] text-gray-400">
                  Un solo mensaje con todos los servicios, no uno por cada uno.
                </span>
              </span>
            </label>
          </section>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {ok && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">✅ {ok}</div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={!listo || pending} className="btn-primary flex-1 disabled:opacity-50">
              {pending ? 'Creando…' : 'Crear reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
