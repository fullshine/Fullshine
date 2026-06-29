'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: '¿Qué pasa si llueve el día de mi cita?',
    a: 'Si el servicio es a domicilio y llueve, te contactamos el día anterior para reagendar sin costo. Si es en nuestro taller, el trabajo se realiza igual — tenemos espacio techado.',
  },
  {
    q: '¿Tengo que dejar el auto o puedo esperar?',
    a: 'Depende del servicio. Los lavados (3-5h) tienen zona de espera en el taller. Para pulidos y cerámicos (6-12h) recomendamos dejar el vehículo y retirarlo al finalizar. Te avisamos por WhatsApp cuando esté listo.',
  },
  {
    q: '¿El servicio a domicilio tiene costo adicional?',
    a: 'No. El precio es el mismo tanto en taller como a domicilio dentro de Concepción y San Pedro de la Paz. Solo necesitamos un espacio con acceso al auto.',
  },
  {
    q: '¿Cómo funciona el pago? ¿Debo pagar todo por adelantado?',
    a: 'Solo se requiere un anticipo del 20% para confirmar la reserva, que se paga por link de pago seguro (tarjeta o transferencia). El 80% restante se cancela al finalizar el servicio.',
  },
  {
    q: '¿Los precios que muestran son exactos?',
    a: 'Los precios mostrados son "desde" porque varían según el tipo de vehículo (Hatch/Sedan, SUV/Camioneta, Pickup XL). Al reservar seleccionas tu tipo de vehículo y verás el precio exacto antes de confirmar.',
  },
  {
    q: '¿Trabajan los fines de semana?',
    a: 'Sí. Atendemos de lunes a viernes de 09:00 a 18:00 y los sábados de 09:00 a 14:00. Puedes reservar online en cualquier momento y tu turno queda confirmado al instante.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 bg-gray-950 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Preguntas frecuentes</p>
          <h2 className="text-3xl font-bold text-white">Todo lo que necesitas saber</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-white text-sm leading-snug">{faq.q}</span>
                <span className={cn(
                  'shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-gray-400 transition-transform duration-200',
                  open === i && 'rotate-45 border-amber-500/40 text-amber-400'
                )}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
