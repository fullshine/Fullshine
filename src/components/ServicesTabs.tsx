'use client'

import { isMetalCoat } from '@/lib/ceramicos'
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import ServiceDescription from '@/components/ServiceDescription'
import { isPromoActive, promoPrice, formatCLP, PROMO_CERAMICO, PROMO_OTROS } from '@/lib/promo'

const CATEGORY_LABELS: Record<string, string> = {
  lavado_detallado: 'Lavado',
  tapiz: 'Tapiz',
  pulido: 'Pulidos',
  ceramico: 'Cerámico',
  mantencion: 'Mantención',
  adicional: 'Adicionales',
  precompra: 'Precompra',
}

const CATEGORY_ICONS: Record<string, string> = {
  lavado_detallado: '🚿',
  tapiz: '🧹',
  pulido: '✨',
  ceramico: '💎',
  mantencion: '🔄',
  adicional: '➕',
  precompra: '🔍',
}

const SERVICE_ICONS: Record<string, string> = {
  'platino': '🥈',
  'gold':    '🥇',
  'elite':   '👑',
  'deluxe':  '⭐',
  'supremo': '🌟',
  'abrillantador': '✨',
  'avanzado': '⚡',
}

const VEHICLE_LABELS: Record<string, string> = {
  hatch_sedan: 'Hatch / Sedan',
  suv_camioneta: 'SUV / Camioneta',
  pickup_xl: 'Pickup XL',
}
const VEHICLE_ORDER = ['hatch_sedan', 'suv_camioneta', 'pickup_xl']

interface Service {
  id: string
  name: string
  description?: string | null
  category?: string | null
  duration_hours?: number | null
  prices?: { vehicle_type: string; price_clp: number }[]
}

export default function ServicesTabs({
  grouped,
  orderedCategories,
}: {
  grouped: Record<string, Service[]>
  orderedCategories: string[]
}) {
  const [active, setActive] = useState(orderedCategories[0])
  const [ceramicYears, setCeramicYears] = useState<1 | 3>(1)
  const planRank = (name: string) => {
    const rank = ['platino', 'gold', 'elite'].findIndex(plan => name.toLowerCase().includes(plan))
    return rank < 0 ? 3 : rank
  }
  const ceramicServices = grouped.ceramico ?? []
  const availableYears = ([1, 3] as const).filter(year => ceramicServices.some(service => isMetalCoat(service) === (year === 1)))
  const selectedYears = availableYears.includes(ceramicYears) ? ceramicYears : availableYears[0]

  const services = grouped[active] ?? []
  const sections = active === 'ceramico'
    ? [{
        title: selectedYears === 1 ? 'Protección de 1 año · Nasiol Metal Coat' : 'Protección de 3 años · Nasiol ZR53',
        services: services.filter(service => isMetalCoat(service) === (selectedYears === 1))
          .sort((a, b) => planRank(a.name) - planRank(b.name)),
      }]
    : [{ title: '', services }]
  const discount = active === 'ceramico' ? PROMO_CERAMICO : PROMO_OTROS
  const discountLabel = `${Math.round(discount * 100)}% OFF`
  // Solo se muestra la promo en las categorías que sí tienen descuento
  const promo = isPromoActive() && discount > 0

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-10">
        {orderedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              active === cat
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5 hover:border-white/15'
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {active === 'ceramico' && availableYears.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-8" role="group" aria-label="Duración de la protección cerámica">
          {availableYears.map(year => (
            <button key={year} type="button" aria-pressed={selectedYears === year}
              onClick={() => setCeramicYears(year)}
              className={['px-5 py-3 rounded-xl text-sm font-semibold border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400', selectedYears === year ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-900 text-gray-200 border-white/15 hover:border-amber-400'].join(' ')}>
              {year === 1 ? '1 año · Metal Coat' : '3 años · ZR53'}
            </button>
          ))}
        </div>
      )}

      {/* Service cards */}
      {sections.map(section => (
      <section key={section.title} className="mb-8">
      {section.title && <h3 className="text-xl font-bold text-amber-400 mb-4">{section.title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.services.map(service => {
          const prices = service.prices ?? []
          const priceByType: Record<string, number> = {}
          prices.forEach((p: any) => { if (p.price_clp) priceByType[p.vehicle_type] = p.price_clp })
          const shownPrices = VEHICLE_ORDER.filter(t => priceByType[t])
          const icon = Object.entries(SERVICE_ICONS).find(([k]) =>
            service.name.toLowerCase().includes(k)
          )?.[1] ?? CATEGORY_ICONS[active] ?? '🔧'

          return (
            <div key={service.id} className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-colors h-full flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-white flex items-center gap-2">
                    <span>{icon}</span>
                    {service.name}
                  </p>
                  {active === 'ceramico' && (
                    <ul className="mt-3 mb-3 space-y-1.5 text-sm text-gray-200">
                      <li>✓ Pulido avanzado y protección cerámica de pintura</li>
                      {/gold|elite/i.test(service.name) && <li>✓ Sellado cerámico de vidrios</li>}
                      {/elite/i.test(service.name) && <li>✓ Sellado de plásticos externos e internos y llantas</li>}
                      <li>✓ Limpieza interior profunda de cortesía</li>
                    </ul>
                  )}
                  {service.description && (
                    <ServiceDescription text={service.description} tone="dark" className="mt-1 block" />
                  )}
                  {service.duration_hours && (
                    <p className="text-gray-400 text-sm mt-2">⏱ {service.duration_hours}h aprox.</p>
                  )}
                </div>
              </div>
              {shownPrices.length > 0 ? (
                <div className="border-t border-white/5 pt-3">
                  {promo && (
                    <p className="text-center text-green-400 text-[11px] font-bold uppercase tracking-wide mb-2">
                      {discountLabel} · solo por hoy
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {shownPrices.map(type => (
                      <div key={type} className="text-center">
                        <p className="text-white text-xs mb-1 font-medium">{VEHICLE_LABELS[type]}</p>
                        {promo ? (
                          <>
                            <p className="text-gray-400 text-xs line-through">{formatCurrency(priceByType[type])}</p>
                            <p className="font-bold text-amber-400 text-sm">{formatCLP(promoPrice(priceByType[type], discount))}</p>
                          </>
                        ) : (
                          <p className="font-bold text-amber-400 text-sm">{formatCurrency(priceByType[type])}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm border-t border-white/5 pt-3">Consultar precio</p>
              )}
              {active === 'ceramico' && (
                <div className="mt-auto pt-5">
                  <Link href={'/reservar?categoria=ceramico&servicio=' + encodeURIComponent(service.id)}
                    aria-label={'Reservar ' + service.name}
                    className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-3 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
                    Reservar este plan
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      </section>
      ))}

      <div className="text-center mt-10">
        <Link
          href="/reservar"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
        >
          Reservar mi turno
        </Link>
      </div>
    </div>
  )
}
