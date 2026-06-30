'use client'

import { useState, useEffect, useTransition } from 'react'
import { createBooking } from '@/actions/bookings'
import { getServices } from '@/actions/bookings'
import { cn } from '@/lib/utils'
import type { Service, VehicleType } from '@/types'

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'hatch_sedan', label: 'Hatch / Sedan' },
  { value: 'suv_camioneta', label: 'SUV / Camioneta' },
  { value: 'pickup_xl', label: 'Pickup XL' },
]

const SLOTS = [
  { label: '☀️ Mañana (09:00)', value: '09:00' },
  { label: '🌤 Tarde (14:00)', value: '14:00' },
]

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ManualBookingModal({ open, onClose, onSuccess }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_type: '' as VehicleType | '',
    service_id: '',
    date: '',
    slot: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      getServices().then(r => {
        if (r.success && r.data) setServices(r.data.filter(s => s.is_active))
      })
      setError(null)
      setSuccess(false)
      setForm({
        full_name: '', phone: '', email: '',
        vehicle_make: '', vehicle_model: '', vehicle_type: '',
        service_id: '', date: '', slot: '', notes: '',
      })
    }
  }, [open])

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const selectedService = services.find(s => s.id === form.service_id)
  const selectedPrice = selectedService?.prices?.find(p => p.vehicle_type === form.vehicle_type)

  const canSubmit =
    form.full_name.trim() &&
    form.phone.trim() &&
    form.vehicle_make.trim() &&
    form.vehicle_model.trim() &&
    form.vehicle_type &&
    form.service_id &&
    form.date &&
    form.slot

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)

    startTransition(async () => {
      const scheduledAt = `${form.date}T${form.slot}:00`
      const result = await createBooking({
        customer: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
        },
        vehicle: {
          make: form.vehicle_make.trim(),
          model: form.vehicle_model.trim(),
          year: new Date().getFullYear(),
          vehicle_type: form.vehicle_type as VehicleType,
        },
        service_id: form.service_id,
        scheduled_at: scheduledAt,
        notes: form.notes.trim() || undefined,
      })

      if (!result.success) {
        setError(result.error ?? 'Error al crear la reserva')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    })
  }

  // Fecha mínima: hoy
  const today = new Date().toISOString().split('T')[0]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nueva reserva manual</h2>
            <p className="text-xs text-gray-500 mt-0.5">Para clientes que llegan por teléfono, WhatsApp o en persona</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Cliente */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-500 text-white rounded-full text-xs flex items-center justify-center">1</span>
              Cliente
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Juan Pérez"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="9 1234 5678"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-gray-400">(opcional)</span></label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="juan@email.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Vehículo */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-500 text-white rounded-full text-xs flex items-center justify-center">2</span>
              Vehículo
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="Toyota"
                    value={form.vehicle_make}
                    onChange={e => set('vehicle_make', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="Corolla"
                    value={form.vehicle_model}
                    onChange={e => set('vehicle_model', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de vehículo *</label>
                <div className="grid grid-cols-3 gap-2">
                  {VEHICLE_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('vehicle_type', t.value)}
                      className={cn(
                        'py-2 px-2 rounded-lg border text-xs font-medium transition-colors text-center',
                        form.vehicle_type === t.value
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-brand-400'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Servicio */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-500 text-white rounded-full text-xs flex items-center justify-center">3</span>
              Servicio
            </h3>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={form.service_id}
              onChange={e => set('service_id', e.target.value)}
              required
            >
              <option value="">Selecciona un servicio...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {selectedPrice && (
              <p className="text-xs text-brand-600 font-medium mt-1.5">
                💰 Precio: ${selectedPrice.price_clp.toLocaleString('es-CL')} CLP
              </p>
            )}
            {form.service_id && form.vehicle_type && !selectedPrice && (
              <p className="text-xs text-orange-500 mt-1.5">Sin precio configurado para este tipo de vehículo</p>
            )}
          </section>

          {/* Fecha y hora */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-500 text-white rounded-full text-xs flex items-center justify-center">4</span>
              Fecha y horario
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input
                  type="date"
                  min={today}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Horario *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('slot', s.value)}
                      className={cn(
                        'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                        form.slot === s.value
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-brand-400'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notas */}
          <section>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas <span className="text-gray-400">(opcional)</span></label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Observaciones, estado del vehículo, solicitudes especiales..."
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              ✅ Reserva creada y WhatsApp enviado al cliente
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || pending || success}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? 'Creando reserva...' : '+ Crear reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
