'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { StaggerList, StaggerItem, HoverCard } from '@/components/animations'
import ServiceDescription from '@/components/ServiceDescription'

const CATEGORY_LABELS: Record<string, string> = {
  lavado_detallado: 'Lavado',
  tapiz: 'Tapiz',
  pulido: 'Pulidos',
  ceramico: 'Cerámico',
  adicional: 'Adicionales',
  precompra: 'Precompra',
}

const CATEGORY_ICONS: Record<string, string> = {
  lavado_detallado: '🚿',
  tapiz: '🧹',
  pulido: '✨',
  ceramico: '💎',
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

  const services = grouped[active] ?? []

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

      {/* Service cards */}
      <StaggerList key={active} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => {
          const prices = service.prices ?? []
          const priceByType: Record<string, number> = {}
          prices.forEach(p => { if (p.price_clp) priceByType[p.vehicle_type] = p.price_clp })
          const shownPrices = VEHICLE_ORDER.filter(t => priceByType[t])
          const icon = Object.entries(SERVICE_ICONS).find(([k]) =>
            service.name.toLowerCase().includes(k)
          )?.[1] ?? CATEGORY_ICONS[active] ?? '🔧'

          return (
            <StaggerItem key={service.id}>
              <HoverCard className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-colors h-full">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <span>{icon}</span>
                      {service.name}
                    </p>
                    {service.description && (
                      <ServiceDescription text={service.description} className="mt-1 block" />
                    )}
                    {service.duration_hours && (
                      <p className="text-gray-600 text-xs mt-1.5">⏱ {service.duration_hours}h aprox.</p>
                    )}
                  </div>
                </div>
                {shownPrices.length > 0 ? (
                  <div className="border-t border-white/5 pt-3 grid grid-cols-3 gap-2">
                    {shownPrices.map(type => (
                      <div key={type} className="text-center">
                        <p className="text-white text-xs mb-1 font-medium">{VEHICLE_LABELS[type]}</p>
                        <p className="font-bold text-amber-400 text-sm">{formatCurrency(priceByType[type])}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm border-t border-white/5 pt-3">Consultar precio</p>
                )}
              </HoverCard>
            </StaggerItem>
          )
        })}
      </StaggerList>

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
