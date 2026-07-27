import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { isPromoActive, promoPrice, formatCLP, PROMO_CERAMICO } from '@/lib/promo'
import WhatsAppButton from '@/components/WhatsAppButton'
import GalleryCarousel from '@/components/GalleryCarousel'
import PixelEvent from '@/components/PixelEvent'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '25% OFF Tratamiento Cerámico — Solo Julio | Fullshine Concepción',
  description: 'Oferta de julio: 25% de descuento en sellado cerámico Nasiol ZR53 (10H). Incluye pulido de pintura. Concepción y San Pedro de la Paz. Cupos limitados.',
  // Landing para tráfico pagado — no necesita indexarse en Google
  robots: { index: false, follow: true },
  openGraph: {
    title: '25% OFF Tratamiento Cerámico — Solo Julio',
    description: 'Nasiol ZR53 (10H) con pulido incluido. Desde $225.000 en Concepción.',
    url: 'https://www.fullshine.autos/oferta-tratamiento-ceramico',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: 'https://www.fullshine.autos/hero-jaguar.jpg', width: 1600, height: 900 }],
  },
}

const TIERS = [
  {
    icon: '🥈', name: 'Platino', slug: 'ceramico-platino', basePrice: 300000,
    pitch: 'Protección esencial de alta calidad',
    features: ['Lavado técnico + descontaminación', 'Pulido avanzado de pintura', 'Cerámica Nasiol ZR53 (10H)', 'Limpieza interior de cortesía'],
  },
  {
    icon: '🥇', name: 'Gold', slug: 'ceramico-gold', basePrice: 350000, popular: true,
    pitch: 'El más elegido — agrega vidrios sellados',
    features: ['Todo lo del Platino', '+ Sellado cerámico de vidrios', 'Visibilidad perfecta bajo lluvia'],
  },
  {
    icon: '👑', name: 'Elite', slug: 'ceramico-elite', basePrice: 500000,
    pitch: 'Protección total del vehículo',
    features: ['Todo lo del Gold', '+ Sellado de plásticos', '+ Sellado de llantas'],
  },
]

const BENEFITS = [
  { icon: '🛡️', title: '3 a 5 años de protección', desc: 'Cerámica 10H certificada. 3 años de fábrica, extensible a 5 con mantenciones.' },
  { icon: '💧', title: 'Efecto hidrofóbico', desc: 'El agua y la suciedad resbalan. Tu auto se mantiene limpio por más tiempo.' },
  { icon: '✨', title: 'Pulido incluido', desc: 'Corregimos rayas finas y hologramas antes de sellar. Otros lo cobran aparte.' },
  { icon: '📜', title: 'Certificado de garantía', desc: 'Documento digital con código único verificable. Respaldo real, también para reventa.' },
]

const REVIEWS = [
  { name: 'Cata Mayorga', text: 'Volví a contratar sus servicios luego de un cambio de vehículo. Quedé encantada con el resultado.' },
  { name: 'Jorge Bizama', text: 'El lavado y pulido dejó el auto como nuevo. El dueño amable, explicó paso a paso lo que iba realizando.' },
  { name: 'Jonathan Ramírez', text: 'Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.' },
]

const FAQS = [
  { q: '¿El descuento se aplica automáticamente?', a: 'Sí. Al reservar online, el 25% ya está aplicado en el precio que ves. Sin códigos ni trámites.' },
  { q: '¿Hasta cuándo dura la oferta?', a: 'Hasta el 31 de julio de 2026, o hasta agotar los cupos disponibles del mes.' },
  { q: '¿Cuánto se paga para reservar?', a: 'Solo un anticipo del 20%. El resto se paga al retirar el vehículo.' },
  { q: '¿Cuánto demora el tratamiento?', a: 'Entre 1 y 2 días según el paquete. Te confirmamos el tiempo exacto al reservar.' },
]

export default function OfertaCeramicoLanding() {
  const promo = isPromoActive()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PixelEvent
        event="ViewContent"
        contentName="Landing oferta cerámico 25% OFF"
        contentCategory="ceramico"
      />
      <WhatsAppButton />

      {/* NAV MINIMAL — sin menú para no fugar tráfico de la campaña */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fullshine" width={40} height={40} className="rounded-full" />
            <div>
              <p className="font-bold text-white leading-none tracking-wide text-sm">FULLSHINE</p>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">Detailing Premium</p>
            </div>
          </Link>
          <Link href="/reservar?categoria=ceramico"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black text-sm px-5 py-2 rounded-full transition-all">
            Reservar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          {promo ? (
            <span className="inline-block bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-black uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
              🔥 Solo julio · 25% OFF
            </span>
          ) : (
            <span className="inline-block bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-black uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
              Tratamiento cerámico premium
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
            Protege tu auto por años,{' '}<br className="hidden md:block" />
            <span className="text-amber-400">no por semanas</span>
          </h1>
          <p className="text-gray-300 text-lg mb-3 max-w-xl mx-auto">
            Sellado cerámico <strong className="text-white">Nasiol ZR53 (10H)</strong> con pulido de pintura incluido.
            {promo && <> Este mes desde <span className="text-green-400 font-black">{formatCLP(promoPrice(300000, PROMO_CERAMICO))}</span> <span className="text-gray-500 line-through text-base">$300.000</span>.</>}
          </p>
          <p className="text-gray-500 text-sm mb-8">Concepción & San Pedro de la Paz · 82 reseñas ⭐ 5.0 en Google</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservar?categoria=ceramico"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/25">
              Reservar con 25% OFF
            </Link>
            <a href="https://wa.me/56933654943?text=Hola%2C%20vi%20la%20oferta%20del%2025%25%20en%20cer%C3%A1mico%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank" rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-10 py-4 rounded-full transition-colors">
              Consultar por WhatsApp
            </a>
          </div>
          {promo && <p className="text-gray-500 text-xs mt-4">Válido hasta el 31 de julio · Solo anticipo del 20% para confirmar</p>}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-4 border-y border-white/5 bg-gray-900/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl mb-3">{b.icon}</p>
              <p className="font-bold text-white mb-1">{b.title}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALERÍA DE TRABAJOS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Nuestros trabajos</h2>
          <p className="text-gray-400 text-center mb-10">Autos reales sellados en Fullshine — el brillo habla por sí solo</p>
          <GalleryCarousel />
        </div>
      </section>

      {/* PRECIOS ANTES / DESPUÉS */}
      <section className="py-20 px-4 bg-gray-900/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Elige tu paquete</h2>
          <p className="text-gray-400 text-center mb-12">
            Precios para Hatch/Sedan — el precio exacto según tu vehículo lo ves al reservar
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div key={tier.name}
                className={`rounded-2xl p-6 border flex flex-col ${tier.popular ? 'bg-amber-500/10 border-amber-500/40 relative md:scale-105' : 'bg-gray-900 border-white/5'}`}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-black px-3 py-0.5 rounded-full">
                    Más popular
                  </span>
                )}
                <div className="text-3xl mb-2">{tier.icon}</div>
                <h3 className={`text-2xl font-black mb-1 ${tier.popular ? 'text-amber-400' : 'text-white'}`}>{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{tier.pitch}</p>

                {promo ? (
                  <div className="mb-5">
                    <p className="text-gray-500 line-through text-sm">desde {formatCLP(tier.basePrice)}</p>
                    <p className="text-3xl font-black text-green-400">
                      {formatCLP(promoPrice(tier.basePrice, PROMO_CERAMICO))}
                    </p>
                    <p className="text-[11px] font-bold text-green-400/80 uppercase tracking-wide mt-1">
                      Ahorras {formatCLP(tier.basePrice - promoPrice(tier.basePrice, PROMO_CERAMICO))}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-white mb-5">desde {formatCLP(tier.basePrice)}</p>
                )}

                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/reservar?categoria=ceramico&servicio=${tier.slug}`}
                  className={`block text-center font-black py-3.5 rounded-full text-sm transition-all hover:scale-105 ${tier.popular ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  Reservar {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICADO */}
      <section className="py-16 px-4 bg-gray-900/40 border-y border-amber-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-4xl mb-4">📜</p>
          <h2 className="text-2xl md:text-3xl font-black mb-4">Con certificado de garantía verificable</h2>
          <p className="text-gray-400 leading-relaxed max-w-xl mx-auto">
            Cada tratamiento incluye un certificado digital con código único y QR, que acredita el servicio,
            el producto aplicado y la vigencia de la garantía. <strong className="text-white">Nadie más en Concepción entrega este respaldo.</strong>
          </p>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-amber-400 font-black text-lg mb-2">⭐⭐⭐⭐⭐ 5.0</p>
          <p className="text-center text-gray-500 text-sm mb-10">82 reseñas verificadas en Google</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <p className="text-gray-300 text-sm leading-relaxed mb-3">"{r.text}"</p>
                <p className="text-gray-500 text-xs font-semibold">{r.name} · Cliente verificado</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-900/40 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-xl p-5">
                <p className="font-semibold text-white mb-1.5">{f.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          {promo && (
            <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3">La oferta termina el 31 de julio</p>
          )}
          <h2 className="text-3xl md:text-4xl font-black mb-4">Tu auto merece esta protección</h2>
          <p className="text-gray-400 mb-8">Reserva en 2 minutos. Solo pagas el 20% de anticipo.</p>
          <Link href="/reservar?categoria=ceramico"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/25">
            {promo ? 'Reservar con 25% OFF' : 'Reservar tratamiento cerámico'}
          </Link>
          <p className="mt-5 text-gray-600 text-sm">
            Camilo Henríquez 381, Concepción · +56 9 3365 4943
          </p>
        </div>
      </section>

      {/* FOOTER MINIMAL */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs">
          © 2026 Fullshine Detailing Premium · <Link href="/" className="hover:text-gray-400 transition-colors">www.fullshine.autos</Link>
        </p>
      </footer>
    </div>
  )
}
