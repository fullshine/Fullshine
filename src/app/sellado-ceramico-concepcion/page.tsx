import Link from 'next/link'
import { Metadata } from 'next'
import { getServicesByCategory } from '@/actions/bookings'
import { formatCurrency } from '@/lib/utils'
import { isPromoActive, promoPrice, formatCLP, PROMO_CERAMICO } from '@/lib/promo'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tratamiento Cerámico en Concepción | Sellado Nasiol ZR53 10H — Fullshine',
  description: 'Tratamiento cerámico para autos en Concepción y San Pedro de la Paz. Sellado Nasiol ZR53 (10H) desde $300.000: 3 años de protección de fábrica, extensible a 5. Precios claros y reserva online.',
  keywords: [
    'tratamiento cerámico Concepción',
    'sellado cerámico Concepción',
    'cerámico para autos Concepción',
    'tratamiento cerámico San Pedro de la Paz',
    'coating cerámico Concepción',
    'Nasiol ZR53 Chile',
  ],
  alternates: { canonical: 'https://www.fullshine.autos/sellado-ceramico-concepcion' },
  openGraph: {
    title: 'Tratamiento Cerámico en Concepción | Nasiol ZR53 10H — Fullshine',
    description: 'Tratamiento cerámico profesional con Nasiol ZR53 (10H). Platino desde $300.000, Gold desde $350.000, Elite desde $500.000.',
    url: 'https://www.fullshine.autos/sellado-ceramico-concepcion',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
  },
}

const TIERS = [
  {
    icon: '🥈', name: 'Platino', price: 'desde $300.000', basePrice: 300000,
    features: ['Lavado técnico + descontaminación', 'Pulido avanzado de pintura', 'Cerámica Nasiol ZR53 10H (3 años + extensión)', 'Limpieza interior de cortesía'],
    extras: [],
  },
  {
    icon: '🥇', name: 'Gold', price: 'desde $350.000', basePrice: 350000, popular: true,
    features: ['Lavado técnico + descontaminación', 'Pulido avanzado de pintura', 'Cerámica Nasiol ZR53 10H (3 años + extensión)', 'Limpieza interior de cortesía'],
    extras: ['Sellado cerámico de vidrios'],
  },
  {
    icon: '👑', name: 'Elite', price: 'desde $500.000', basePrice: 500000,
    features: ['Lavado técnico + descontaminación', 'Pulido avanzado de pintura', 'Cerámica Nasiol ZR53 10H (3 años + extensión)', 'Limpieza interior de cortesía'],
    extras: ['Sellado cerámico de vidrios', 'Sellado cerámico de plásticos', 'Sellado cerámico de llantas'],
  },
]

const PROCESS = [
  { n: '01', title: 'Lavado técnico profundo', desc: 'Descontaminación química y mecánica de toda la superficie para que la cerámica adhiera perfectamente.' },
  { n: '02', title: 'Pulido de corrección', desc: 'Eliminamos rayas finas, holograma y oxidación para dejar la pintura perfecta antes de aplicar la cerámica.' },
  { n: '03', title: 'Desengrase IPA', desc: 'Limpieza final con alcohol isopropílico para eliminar cualquier residuo de aceite o silicona.' },
  { n: '04', title: 'Aplicación Nasiol ZR53', desc: 'Aplicamos la cerámica capa por capa en ambiente controlado, cubriendo cada panel con precisión.' },
  { n: '05', title: 'Curado y control de calidad', desc: 'Dejamos curar el tiempo necesario y revisamos cada centímetro antes de entregarte el vehículo.' },
]

const FAQS = [
  {
    q: '¿Cuánto cuesta un tratamiento cerámico en Concepción?',
    a: 'En Fullshine el tratamiento cerámico parte en $300.000 (paquete Platino), $350.000 el Gold y $500.000 el Elite. El precio varía según el tipo de vehículo y el estado de la pintura. Todos incluyen lavado técnico, descontaminación, pulido de corrección y aplicación de Nasiol ZR53 10H. En el mercado local vas a encontrar desde $80.000 hasta $600.000: la diferencia está en la cerámica que se usa y en si incluye o no la preparación de la pintura.',
  },
  {
    q: '¿Es lo mismo tratamiento cerámico que sellado cerámico?',
    a: 'Sí, son el mismo servicio. También se le dice coating cerámico, nano cerámico o simplemente cerámica. Todos se refieren a aplicar una capa de sílice (SiO₂) sobre la pintura, que endurece al curar y forma una barrera protectora. Lo que cambia entre talleres no es el nombre, sino la concentración del producto y la preparación previa.',
  },
  {
    q: '¿Dónde hacer un tratamiento cerámico en Concepción?',
    a: 'Estamos en Camilo Henríquez 381, Concepción centro, con taller propio e iluminación LED de inspección. Atendemos de lunes a viernes de 09:00 a 18:00 y sábados de 09:00 a 14:00. Antes de cotizar te ofrecemos un diagnóstico gratuito de 15 minutos donde medimos el espesor real de tu laca y te decimos si tu auto es candidato al tratamiento.',
  },
  { q: '¿Cuánto dura el sellado cerámico?', a: 'El Nasiol ZR53 tiene una duración de fábrica de 3 años, extensible hasta 5 con nuestro programa de mantenciones Fullshine. Mientras la protección esté vigente, reduce significativamente la necesidad de aplicar ceras.' },
  { q: '¿El sellado cerámico protege contra rayones?', a: 'La cerámica aporta mayor resistencia frente a micro-rayas y daños leves del lavado cotidiano. No reemplaza el PPF contra impactos fuertes ni rayones profundos.' },
  { q: '¿Cuánto tiempo demora el proceso completo?', a: 'Depende del paquete: Platino toma 1 día, Gold 1-2 días y Elite hasta 2 días. El auto queda listo para retirar cuando el curado esté completo.' },
  { q: '¿Puedo mojar el auto después del sellado?', a: 'Recomendamos no mojar el auto por 48-72 horas después del tratamiento para que el curado sea óptimo.' },
  { q: '¿Qué diferencia hay entre cerámica y cera?', a: 'La cera dura 1-3 meses y no endurece la pintura. La cerámica dura años, crea una capa dura que protege, y el agua rebota en perlas perfectas (efecto lotus).' },
]

export default async function SelladoCeramicoPage() {
  const result = await getServicesByCategory('ceramico')
  const services = result.data ?? []
  const promo = isPromoActive()

  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Tratamiento Cerámico en Concepción',
    alternateName: ['Sellado Cerámico Concepción', 'Coating Cerámico Concepción'],
    serviceType: 'Tratamiento cerámico automotriz',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Fullshine Detailing Premium',
      url: 'https://www.fullshine.autos',
      telephone: '+56933654943',
      sameAs: ['https://www.instagram.com/fullshinespp'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Camilo Henríquez 381',
        addressLocality: 'Concepción',
        addressRegion: 'Biobío',
        addressCountry: 'CL',
      },
    },
    areaServed: [
      { '@type': 'City', name: 'Concepción' },
      { '@type': 'City', name: 'San Pedro de la Paz' },
      { '@type': 'City', name: 'Chiguayante' },
      { '@type': 'City', name: 'Talcahuano' },
      { '@type': 'City', name: 'Hualpén' },
    ],
    description: 'Tratamiento cerámico profesional en Concepción con Nasiol ZR53 (10H). 3 años de protección de fábrica, extensible a 5 con mantenciones. Tres paquetes: Platino, Gold y Elite.',
    offers: [
      { '@type': 'Offer', name: 'Cerámico Platino', priceSpecification: { '@type': 'PriceSpecification', minPrice: 300000, priceCurrency: 'CLP' } },
      { '@type': 'Offer', name: 'Cerámico Gold', priceSpecification: { '@type': 'PriceSpecification', minPrice: 350000, priceCurrency: 'CLP' } },
      { '@type': 'Offer', name: 'Cerámico Elite', priceSpecification: { '@type': 'PriceSpecification', minPrice: 500000, priceCurrency: 'CLP' } },
    ],
  }

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.fullshine.autos' },
      { '@type': 'ListItem', position: 2, name: 'Tratamiento Cerámico en Concepción', item: 'https://www.fullshine.autos/sellado-ceramico-concepcion' },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([schemaService, schemaFAQ, schemaBreadcrumb]) }} />
      <SiteNav />
      <WhatsAppButton />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">Concepción &amp; San Pedro de la Paz</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Tratamiento Cerámico{' '}<br />
            <span className="text-amber-400">en Concepción</span>
          </h1>
          <p className="text-gray-300 text-lg mb-4 max-w-xl mx-auto">
            Protege tu pintura con <strong className="text-white">Nasiol ZR53</strong> — cerámica certificada 10H, una de las más duras del mercado. 3 años de protección de fábrica (extensible a 5 con mantenciones), brillo espejo y efecto hidrofóbico durante toda la vigencia del tratamiento.
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
            También conocido como <strong className="text-gray-300">sellado cerámico</strong> o{' '}
            <strong className="text-gray-300">coating cerámico</strong>. Atendemos Concepción,
            San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservar" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105">
              Reservar ahora
            </Link>
            <a href="https://wa.me/56933654943?text=Hola%2C%20quiero%20cotizar%20un%20sellado%20cer%C3%A1mico" target="_blank" rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* NASIOL ZR53 HIGHLIGHT */}
      <section className="py-16 px-4 bg-amber-500/5 border-y border-amber-500/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3-5 años', label: 'Protección (3 de fábrica + extensión con mantenciones)' },
            { value: '10H', label: 'Dureza certificada' },
            { value: '150°C', label: 'Resistencia térmica' },
            { value: 'Efecto lotus', label: 'Repele agua y suciedad' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl md:text-3xl font-black text-amber-400 mb-1">{s.value}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAQUETES */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Elige tu paquete cerámico</h2>
          <p className="text-gray-400 text-center mb-12">Todos incluyen Nasiol ZR53 (10H) — 3 años de protección, extensible a 5 con mantenciones</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div key={tier.name} className={`rounded-2xl p-6 border flex flex-col ${tier.popular ? 'bg-amber-500/10 border-amber-500/40 relative' : 'bg-gray-900 border-white/5'}`}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-3 py-0.5 rounded-full">
                    Más popular
                  </span>
                )}
                <div className="text-3xl mb-2">{tier.icon}</div>
                <h3 className={`text-xl font-black mb-1 ${tier.popular ? 'text-amber-400' : 'text-white'}`}>{tier.name}</h3>
                {promo ? (
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 line-through">desde {formatCLP(tier.basePrice)}</p>
                    <p className={`text-lg font-black ${tier.popular ? 'text-amber-400' : 'text-white'}`}>
                      desde {formatCLP(promoPrice(tier.basePrice, PROMO_CERAMICO))}
                    </p>
                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-wide">25% OFF hasta el 31 de julio</p>
                  </div>
                ) : (
                  <p className={`text-sm mb-5 ${tier.popular ? 'text-amber-300/70' : 'text-gray-500'}`}>{tier.price}</p>
                )}
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span> {f}
                    </li>
                  ))}
                  {tier.extras.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-300">
                      <span className="text-amber-400 mt-0.5 shrink-0">+</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/reservar?servicio=ceramico-${tier.name.toLowerCase()}`} className={`mt-6 block text-center font-bold py-3 rounded-full text-sm transition-colors ${tier.popular ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  Reservar {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">¿Cómo es el proceso?</h2>
          <p className="text-gray-400 text-center mb-12">Cada paso es fundamental para que el resultado dure años</p>
          <div className="space-y-6">
            {PROCESS.map(step => (
              <div key={step.n} className="flex gap-5 items-start">
                <span className="text-amber-500 font-black text-2xl tabular-nums shrink-0 w-10 text-right">{step.n}</span>
                <div className="border-l border-white/10 pl-5 pb-6">
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICADO DE GARANTÍA */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-gray-900/60 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Texto */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">Respaldo real, no promesas</p>
              <h2 className="text-3xl font-bold mb-4">Certificado de garantía Fullshine</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Cada tratamiento cerámico incluye un <strong className="text-white">certificado digital con código único</strong> que
                acredita el trabajo realizado sobre tu vehículo. Nadie más en Concepción entrega este nivel de respaldo.
              </p>
              <ul className="space-y-3">
                {[
                  ['🔢', 'Código único verificable online en cualquier momento'],
                  ['📋', 'Detalle del servicio, producto aplicado y fecha'],
                  ['🗓️', 'Vigencia de la garantía claramente indicada'],
                  ['📱', 'Código QR para validarlo desde el celular'],
                  ['🔧', 'Condiciones y programa de mantenciones incluidos'],
                ].map(([icon, text], i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="shrink-0">{icon}</span> {text}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-sm mt-6">
                El certificado también respalda el valor de reventa: un comprador puede verificar que la protección cerámica es real y está vigente.
              </p>
            </div>

            {/* Mockup visual del certificado */}
            <div className="relative bg-gray-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10">
              <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
                <p className="text-white font-black text-6xl rotate-[-30deg] tracking-widest">FULLSHINE</p>
              </div>
              <div className="relative px-7 py-7 space-y-4">
                <div className="text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Certificado de Garantía</p>
                  <p className="text-amber-400 font-black text-xl tracking-widest">FS-XXXX-XXXX</p>
                </div>
                <div className="h-px bg-white/5" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Servicio</span><span className="text-white font-semibold">Cerámico Gold</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Producto</span><span className="text-white font-semibold">Nasiol ZR53 (10H)</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Garantía</span><span className="text-white font-semibold">3 años + extensión</span></div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest">Verificable en</p>
                  <p className="text-amber-400 font-bold text-sm">fullshine.autos/certificado</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRECIOS POR TIPO DE VEHÍCULO */}
      {services.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-3">Precios por tipo de vehículo</h2>
            <p className="text-gray-400 text-center mb-10">
              Seleccionas tu vehículo al reservar y ves el precio exacto
              {promo && <span className="block mt-1 text-green-400 font-bold text-sm">Precios con 25% OFF aplicado — válido hasta el 31 de julio</span>}
            </p>
            <div className="space-y-4">
              {services.map(service => {
                const prices = (service.prices ?? []) as { vehicle_type: string; price_clp: number }[]
                const byType: Record<string, number> = {}
                prices.forEach(p => { byType[p.vehicle_type] = p.price_clp })
                return (
                  <div key={service.id} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                    <p className="font-bold text-white mb-4">{service.name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[['hatch_sedan', 'Hatch / Sedan'], ['suv_camioneta', 'SUV / Camioneta'], ['pickup_xl', 'Pickup XL']].map(([type, label]) => (
                        byType[type] ? (
                          <div key={type} className="text-center bg-gray-800/50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            {promo ? (
                              <>
                                <p className="text-xs text-gray-500 line-through">{formatCurrency(byType[type])}</p>
                                <p className="font-black text-amber-400">{formatCLP(promoPrice(byType[type], PROMO_CERAMICO))}</p>
                              </>
                            ) : (
                              <p className="font-black text-amber-400">{formatCurrency(byType[type])}</p>
                            )}
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Preguntas frecuentes sobre cerámica</h2>
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

      {/* CTA FINAL */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger tu auto?</h2>
          <p className="text-gray-400 mb-8">Reserva online en minutos. Confirmación inmediata por WhatsApp.</p>
          <Link href="/reservar" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
            Reservar sellado cerámico
          </Link>
          <p className="mt-4 text-gray-500 text-sm">Concepción y San Pedro de la Paz · Solo anticipo del 20% para confirmar</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
