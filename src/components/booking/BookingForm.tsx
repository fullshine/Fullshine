'use client'

import { useState } from 'react'
import { createBooking, getAvailableSlots } from '@/actions/bookings'
import type { BookingFormData, VehicleType, TimeSlot } from '@/types'
import { cn, formatCurrency, getVehicleTypeLabel } from '@/lib/utils'
import ServiceDescription from '@/components/ServiceDescription'

const VEHICLE_TYPES: VehicleType[] = ['hatch_sedan', 'suv_camioneta', 'pickup_xl']
const STEPS = ['Tus datos', 'Servicio', 'Fecha y Hora', 'Confirmar']

interface Service {
  id: string
  name: string
  description?: string
  category: string
  duration_minutes: number
  prices?: Array<{ vehicle_type: string; price_clp: number }>
}

interface Props {
  services: Service[]
}

const INITIAL_FORM: BookingFormData = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_year: new Date().getFullYear(),
  vehicle_color: '',
  vehicle_license_plate: '',
  vehicle_type: 'hatch_sedan',
  service_id: '',
  scheduled_date: '',
  scheduled_time: '',
  notes: '',
}

export default function BookingForm({ services }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<BookingFormData>(INITIAL_FORM)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const selectedService = services.find(s => s.id === form.service_id)
  const servicePrice = selectedService?.prices?.find(p => p.vehicle_type === form.vehicle_type)?.price_clp

  function getDiscount(price: number, category: string) {
    const pct = category === 'ceramico' ? 0.25 : 0.10
    return { discounted: Math.round(price * (1 - pct)), pct, label: category === 'ceramico' ? '25% OFF' : '10% OFF' }
  }

  const selectedDiscounted = selectedService && servicePrice
    ? getDiscount(servicePrice, selectedService.category)
    : null

  function set(field: keyof BookingFormData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function loadSlots(date: string, serviceId: string) {
    if (!date || !serviceId) return
    setLoadingSlots(true)
    setSlots([])
    const result = await getAvailableSlots(date, serviceId)
    if (result.success && result.data) setSlots(result.data.slots)
    setLoadingSlots(false)
  }

  function canGoNext(): boolean {
    if (step === 0) return !!(
      form.customer_name.trim() &&
      form.customer_phone.trim() &&
      form.vehicle_make.trim() &&
      form.vehicle_model.trim() &&
      form.vehicle_type
    )
    if (step === 1) return !!form.service_id
    if (step === 2) return !!(form.scheduled_date && form.scheduled_time)
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const scheduledAt = `${form.scheduled_date}T${form.scheduled_time}:00`
      const result = await createBooking({
        customer: {
          full_name: form.customer_name,
          phone: form.customer_phone,
          email: form.customer_email || undefined,
        },
        vehicle: {
          make: form.vehicle_make,
          model: form.vehicle_model,
          year: form.vehicle_year,
          color: form.vehicle_color || undefined,
          license_plate: form.vehicle_license_plate || undefined,
          vehicle_type: form.vehicle_type,
        },
        service_id: form.service_id,
        scheduled_at: scheduledAt,
        notes: form.notes || undefined,
      })
      if (result.success) setSuccess(true)
      else setError(result.error ?? 'Error al crear la reserva')
    } catch {
      setError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
        <p className="text-gray-600 mb-6">
          Recibirás una confirmación por WhatsApp al número <strong>{form.customer_phone}</strong>.
        </p>
        <button onClick={() => { setSuccess(false); setForm(INITIAL_FORM); setStep(0) }} className="btn-primary">
          Nueva reserva
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-brand-500 text-white' :
                'bg-gray-200 text-gray-500'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 w-12 mx-1', i < step ? 'bg-green-500' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">Paso {step + 1}: {STEPS[step]}</p>
      </div>

      <div className="p-6 space-y-4">

        {/* Step 0: Cliente + Vehículo */}
        {step === 0 && (
          <>
            <h3 className="font-semibold text-gray-900">Tus datos de contacto</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                className={cn('input-field', showErrors && !form.customer_name.trim() && 'border-red-400 focus:ring-red-300')}
                placeholder="Juan Pérez" value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)} />
              {showErrors && !form.customer_name.trim() && (
                <p className="text-xs text-red-500 mt-1">Ingresa tu nombre completo</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
              <input
                className={cn('input-field', showErrors && !form.customer_phone.trim() && 'border-red-400 focus:ring-red-300')}
                placeholder="+56 9 1234 5678" value={form.customer_phone}
                onChange={e => set('customer_phone', e.target.value)} type="tel" />
              {showErrors && !form.customer_phone.trim() && (
                <p className="text-xs text-red-500 mt-1">Ingresa tu número de WhatsApp</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(opcional — para recibir link de pago)</span></label>
              <input className="input-field" placeholder="juan@email.com" value={form.customer_email}
                onChange={e => set('customer_email', e.target.value)} type="email" />
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="font-semibold text-gray-900 mb-3">Tu vehículo</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input
                    className={cn('input-field', showErrors && !form.vehicle_make.trim() && 'border-red-400 focus:ring-red-300')}
                    placeholder="Toyota" value={form.vehicle_make}
                    onChange={e => set('vehicle_make', e.target.value)} />
                  {showErrors && !form.vehicle_make.trim() && (
                    <p className="text-xs text-red-500 mt-1">Ingresa la marca</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input
                    className={cn('input-field', showErrors && !form.vehicle_model.trim() && 'border-red-400 focus:ring-red-300')}
                    placeholder="Corolla" value={form.vehicle_model}
                    onChange={e => set('vehicle_model', e.target.value)} />
                  {showErrors && !form.vehicle_model.trim() && (
                    <p className="text-xs text-red-500 mt-1">Ingresa el modelo</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de vehículo *</label>
                <div className="grid grid-cols-3 gap-2">
                  {VEHICLE_TYPES.map(type => (
                    <button key={type} type="button"
                      onClick={() => set('vehicle_type', type)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                        form.vehicle_type === type
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-brand-400'
                      )}>
                      {getVehicleTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Servicio */}
        {step === 1 && (
          <>
            <h3 className="font-semibold text-gray-900">Elige tu servicio</h3>
            {showErrors && !form.service_id && (
              <p className="text-xs text-red-500 -mt-1">Selecciona un servicio para continuar</p>
            )}
            <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
              {(() => {
                const CATEGORY_LABELS: Record<string, string> = {
                  lavado_detallado: 'Lavado Detallado',
                  tapiz:            'Tapiz',
                  pulido:           'Pulidos',
                  ceramico:         'Tratamiento Cerámico',
                  adicional:        'Adicionales',
                  precompra:        'Servicio Precompra',
                }
                const CATEGORY_ORDER = ['lavado_detallado', 'tapiz', 'pulido', 'ceramico', 'adicional', 'precompra']
                const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
                  const cat = s.category ?? 'add_on'
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(s)
                  return acc
                }, {})
                const orderedKeys = [
                  ...CATEGORY_ORDER.filter(k => grouped[k]),
                  ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k)),
                ]
                return orderedKeys.map(cat => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </p>
                    <div className="space-y-2">
                      {grouped[cat].map(service => {
                        const priceRecord = service.prices?.find(p => p.vehicle_type === form.vehicle_type)
                        const price = priceRecord?.price_clp
                        const disc = price ? getDiscount(price, service.category) : null
                        return (
                          <button key={service.id} type="button"
                            onClick={() => set('service_id', service.id)}
                            className={cn(
                              'w-full text-left p-4 rounded-xl border-2 transition-all',
                              form.service_id === service.id
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{service.name}</p>
                                {service.description && (
                                  <ServiceDescription text={service.description} className="mt-0.5 block" />
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {(service as any).duration_hours
                                    ? `${(service as any).duration_hours}h`
                                    : service.duration_minutes
                                      ? `${service.duration_minutes} min`
                                      : ''}
                                </p>
                              </div>
                              <div className="text-right ml-4 shrink-0">
                                {disc ? (
                                  <div>
                                    <p className="text-xs text-gray-400 line-through">{formatCurrency(price!)}</p>
                                    <p className="font-bold text-green-600">{formatCurrency(disc.discounted)}</p>
                                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                                      {disc.label}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">Consultar</span>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </>
        )}

        {/* Step 2: Fecha y Hora */}
        {step === 2 && (
          <>
            <h3 className="font-semibold text-gray-900">Elige fecha y hora</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                className={cn('input-field', showErrors && !form.scheduled_date && 'border-red-400 focus:ring-red-300')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.scheduled_date}
                onChange={e => {
                  set('scheduled_date', e.target.value)
                  set('scheduled_time', '')
                  if (e.target.value && form.service_id) loadSlots(e.target.value, form.service_id)
                }} />
              {showErrors && !form.scheduled_date && (
                <p className="text-xs text-red-500 mt-1">Selecciona una fecha</p>
              )}
            </div>
            {form.scheduled_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turno *</label>
                {loadingSlots ? (
                  <p className="text-sm text-gray-500">Cargando disponibilidad...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay turnos disponibles para este día.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {slots.map((slot, i) => {
                      const startTime = slot.start.substring(11, 16)
                      const endTime = slot.end.substring(11, 16)
                      const hour = parseInt(startTime)
                      const turno = hour < 13 ? 'Mañana' : 'Tarde'
                      const isSelected = form.scheduled_time === startTime
                      return (
                        <button key={i} type="button" disabled={!slot.available}
                          onClick={() => set('scheduled_time', startTime)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all',
                            !slot.available
                              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-200 hover:border-brand-300 bg-white'
                          )}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">
                            {turno}
                          </p>
                          <p className={cn('text-2xl font-bold', isSelected ? 'text-brand-600' : 'text-gray-900')}>
                            {startTime}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">hasta las {endTime}</p>
                          <div className={cn('mt-2 text-xs font-medium', !slot.available ? 'text-red-500' : 'text-green-600')}>
                            {!slot.available ? '✕ Sin disponibilidad' : '● Disponible'}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Alguna indicación especial..."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </>
        )}

        {/* Step 3: Confirmar */}
        {step === 3 && (
          <>
            <h3 className="font-semibold text-gray-900">Confirma tu reserva</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <Row label="Nombre" value={form.customer_name} />
              <Row label="WhatsApp" value={form.customer_phone} />
              <Row label="Vehículo" value={`${form.vehicle_make} ${form.vehicle_model}`} />
              <Row label="Tipo" value={getVehicleTypeLabel(form.vehicle_type)} />
              <Row label="Servicio" value={selectedService?.name ?? ''} />
              <Row label="Fecha" value={form.scheduled_date} />
              <Row label="Hora" value={form.scheduled_time} />
              {servicePrice && selectedDiscounted && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Precio normal</span>
                    <span className="line-through">{formatCurrency(servicePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento ({selectedDiscounted.label})</span>
                    <span>-{formatCurrency(servicePrice - selectedDiscounted.discounted)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-brand-600">{formatCurrency(selectedDiscounted.discounted)}</span>
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}
          </>
        )}

      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex justify-between gap-3">
        {step > 0 && (
          <button type="button"
            onClick={() => { setShowErrors(false); setStep(s => s - 1) }}
            className="btn-secondary flex-1">
            Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => {
            if (!canGoNext()) { setShowErrors(true); return }
            setShowErrors(false)
            setStep(s => s + 1)
          }} className="btn-primary flex-1">
            Siguiente
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="btn-primary flex-1">
            {submitting ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
