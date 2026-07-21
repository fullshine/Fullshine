import Link from 'next/link'
import { Metadata } from 'next'
import { getServicesByCategory } from '@/actions/bookings'
import { formatCurrency } from '@/lib/utils'
import { isPromoActive, promoPrice, formatCLP, PROMO_OTROS } from '@/lib/promo'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lavado Detallado en Concepción | Premium — Fullshine',
  description: 'Lavado detallado profesional en Concepción y San Pedro de la Paz. Full Deluxe y Full Supremo con descontaminación, sellado y limpieza profunda. Reserva online 24/7.',
  alternates: { canonical: 'https://www.fullshine.autos/lavado-detallado-concepcion' },
  openGraph: {
    title: 'Lavado Detallado en Concepción | Full Deluxe y Supremo — Fullshine',
    description: 'Lavado detallado premium en Concepción. Full Deluxe desde $40.000 y Full Supremo desde $60.000. A domicilio o en taller.',
    url: 'https://www.fullshine.autos/lavado-detallado-concepcion',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
  },
}

const DIFERENCIAS = [
  {
    name: '⭐ Full Deluxe', duration: '4h aprox.',
    items: [
      'Lavado exterior con espuma activa',
      'Limpieza de ruedas y guardafangos',
      'Descontaminación de vidrios',
      'Limpieza de marcos y juntas',
      'Aspirado interior completo',
      'Limpieza de tablero y consola',
      'Repelente de agua en vidrios',
    ],
    prices: { hatch_sedan: 40000, suv_camioneta: 45000, pickup_xl: 50000 },
  },
  {
    name: '🌟 Full Supremo', duration: '5h aprox.', recommended: true,
    items: [
      'Todo lo del Full Deluxe +',
      'Lavado premium con espuma de doble capa',
      'Limpieza de emblemas y detalles',
      'Ruedas descontaminadas con producto ferroso',
      'Sellado de parabrisas hidrofóbico',
      'Limpieza de plásticos exteriores',
      'Acondicionador de gomas y plásticos',
      'Aromatización del interior',
    ],
    prices: { hatch_sedan: 60000, suv_camioneta: 65000, pickup_xl: 75000 },
  },
]

const FAQS = [
  { q: '¿Qué diferencia hay entre el Full Deluxe y el Full Supremo?', a: 'El Full Supremo es más completo: incluye sellado hidrofóbico de parabrisas, descontaminación ferrosa de ruedas, acondicionador de gomas y aromatización. El Full Deluxe es ideal para mantenimiento regular, el Supremo para un resultado más profundo.' },
  { q: '¿Puedo esperar mientras hacen el lavado?', a: 'Sí, tenemos zona de espera en el taller. Los lavados demoran entre 4 y 5 horas. También puedes dejar el auto y retirarlo al finalizar.' },
  { q: '¿El servicio a domicilio tiene costo adicional?', a: 'No. El precio es el mismo en taller o a domicilio dentro de Concepción y San Pedro de la Paz.' },
  { q: '¿Con qué frecuencia debo hacer un lavado detallado?', a: 'Recomendamos cada 4-6 semanas para mantener el vehículo en óptimas condiciones y proteger la pintura a largo plazo.' },
]

export default async function LavadoDetalladoPage() {
  const result = await getServicesByCategory('lavado_detallado')
  const services = result.data ?? []
  const promo = isPromoActive()

  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Lavado Detallado Concepción',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Fullshine Detailing Premium',
      url: 'https://www.fullshine.autos',
      telephone: '+56933654943',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Camilo Henríquez 381',
        addressLocality: 'Concepción',
        addressRegion: 'Biobío',
        addressCountry: 'CL',
      },
    },
    areaServed: ['Concepción', 'San Pedro de la Paz'],
    description: 'Lavado detallado premium en Concepción. Full Deluxe y Full Supremo con descontaminación, sellado y limpieza profunda.',
    offers: [
      { '@type': 'Offer', name: 'Full Deluxe', priceSpecification: { '@type': 'PriceSpecification', minPrice: 40000, priceCurrency: 'CLP' } },
      { '@type': 'Offer', name: 'Full Supremo', priceSpecification: { '@type': 'PriceSpecification', minPrice: 60000, priceCurrency: 'CLP' } },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }} />
      <SiteNav />
      <WhatsAppButton />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">Concepción &amp; San Pedro de la Paz</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Lavado Detallado{' '}<br />
            <span className="text-amber-400">en Concepción</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            No es un lavado simple. Es una limpieza técnica profunda de interior y exterior que deja tu auto impecable, con descontaminación de pintura y vidrios incluida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservar" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105">
              Reservar ahora
            </Link>
            <a href="https://wa.me/56933654943?text=Hola%2C%20quiero%20cotizar%20un%20lavado%20detallado" target="_blank" rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* COMPARATIVA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Elige tu paquete</h2>
          <p className="text-gray-400 text-center mb-12">Precios según tipo de vehículo. Sin cobros ocultos.{' '}
            {promo && <span className="block mt-1 text-green-400 font-bold text-sm">10% OFF aplicado — válido hasta el 31 de julio</span>}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIFERENCIAS.map(pkg => (
              <div key={pkg.name} className={`rounded-2xl p-6 border flex flex-col ${pkg.recommended ? 'bg-amber-500/10 border-amber-500/40 relative' : 'bg-gray-900 border-white/5'}`}>
                {pkg.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-3 py-0.5 rounded-full">
                    Más completo
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-black ${pkg.recommended ? 'text-amber-400' : 'text-white'}`}>{pkg.name}</h3>
                  <span className="text-gray-500 text-sm">⏱ {pkg.duration}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.items.map((item, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${i === 0 && pkg.recommended ? 'text-amber-300/70 font-medium' : 'text-gray-300'}`}>
                      <span className={`mt-0.5 shrink-0 ${i === 0 && pkg.recommended ? 'text-amber-400' : 'text-green-400'}`}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-2 mb-5">
                  {Object.entries(pkg.prices).map(([type, price]) => (
                    <div key={type} className="text-center">
                      <p className="text-xs text-gray-500 mb-0.5">
                        {type === 'hatch_sedan' ? 'Hatch/Sedan' : type === 'suv_camioneta' ? 'SUV' : 'Pickup XL'}
                      </p>
                      {promo ? (
                        <>
                          <p className="text-[11px] text-gray-600 line-through">{formatCurrency(price)}</p>
                          <p className={`font-black text-sm ${pkg.recommended ? 'text-amber-400' : 'text-white'}`}>{formatCLP(promoPrice(price, PROMO_OTROS))}</p>
                        </>
                      ) : (
                        <p className={`font-black text-sm ${pkg.recommended ? 'text-amber-400' : 'text-white'}`}>{formatCurrency(price)}</p>
                      )}
                    </div>
                  ))}
                </div>
                <Link href={`/reservar?servicio=${pkg.name.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase().replace(/ +/g, "-")}`} className={`block text-center font-bold py-3 rounded-full text-sm transition-colors ${pkg.recommended ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  Reservar {pkg.name.replace(/[⭐🌟]\s/, '')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <p className="font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Tu auto merece un lavado de verdad</h2>
          <p className="text-gray-400 mb-8">Agenda en minutos, confirmación instantánea por WhatsApp.</p>
          <Link href="/reservar" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
            Reservar lavado detallado
          </Link>
          <p className="mt-4 text-gray-500 text-sm">Concepción y San Pedro de la Paz · Solo 20% de anticipo</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
