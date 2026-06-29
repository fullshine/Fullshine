import Link from 'next/link'
import Image from 'next/image'
import { getServices } from '@/actions/bookings'
import { formatCurrency } from '@/lib/utils'
import { FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard, ParallaxSection } from '@/components/animations'
import PromoModal from '@/components/PromoModal'
import FaqSection from '@/components/FaqSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fullshine Detailing Premium | Concepción & San Pedro de la Paz',
  description: 'Detailing profesional en Concepción y San Pedro de la Paz.',
}

const CATEGORY_LABELS: Record<string, string> = {
  lavado_detallado: 'Lavado Detallado',
  tapiz: 'Tapiz',
  pulido: 'Pulidos',
  ceramico: 'Tratamiento Cerámico',
  adicional: 'Adicionales',
  precompra: 'Servicio Precompra',
}

const CATEGORY_ORDER = ['lavado_detallado', 'tapiz', 'pulido', 'ceramico', 'adicional', 'precompra']

const WHY_US = [
  { icon: '🏆', title: 'Calidad premium', desc: 'Productos de primera línea y técnicas profesionales en cada servicio.' },
  { icon: '⏱️', title: 'Puntualidad garantizada', desc: 'Respetamos tu tiempo. Turnos fijos de mañana y tarde sin esperas.' },
  { icon: '🔒', title: 'Tu auto en buenas manos', desc: '2 técnicos especializados con años de experiencia en detailing.' },
  { icon: '📱', title: 'Reserva en minutos', desc: 'Agenda online 24/7 y recibe confirmación por WhatsApp al instante.' },
]

const REVIEWS = [
  {
    name: 'Cata Mayorga J',
    time: 'Hace 5 meses',
    text: 'Hace 3 años llevé mi auto a Fullshine y tuve una muy buena experiencia, por lo que volví a contratar sus servicios luego de un cambio de vehículo. Quedé encantada con el resultado.',
    avatar: 'C',
    photo: '/reviews/review-cata.jpg',
  },
  {
    name: 'Jorge Bizama Gallegos',
    time: 'Hace 5 meses',
    text: 'Muy bueno el trabajo realizado, llegó a la hora al domicilio en Concepción. El lavado y pulido dejó el auto como nuevo, hasta sacó manchas de pintura de topones. El dueño amable, explicó paso a paso lo que iba realizando.',
    avatar: 'J',
    photo: '/reviews/review-jorge.jpg',
  },
  {
    name: 'Jonathan Ramirez Campos',
    time: 'Hace 6 meses',
    text: 'Quedé muy conforme con el servicio de detailing en FullShineSPP. Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.',
    avatar: 'J',
    photo: '/reviews/review-jonathan.jpg',
  },
]

const BUSINESS_FEATURES = [
  { icon: '🚗', title: 'Flota cubierta', desc: 'Desde 2 vehículos. Autos, camionetas o vans con el mismo estándar.' },
  { icon: '📅', title: 'Frecuencia a tu medida', desc: 'Semanal, quincenal o mensual. Tú decides la periodicidad.' },
  { icon: '💰', title: 'Precio preferencial', desc: 'Tarifas especiales por volumen con factura incluida.' },
  { icon: '📍', title: 'Servicio en tu empresa', desc: 'Vamos a tus instalaciones. Sin que tu equipo mueva los vehículos.' },
]

function StarIcon({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-6 h-6'
  return (
    <svg className={`${cls} text-amber-400`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default async function HomePage() {
  const servicesResult = await getServices()
  const services = servicesResult.data ?? []

  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    const cat = s.category ?? 'adicional'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(k => grouped[k]),
    ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k)),
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <PromoModal />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fullshine" width={44} height={44} className="rounded-full" />
            <div>
              <p className="font-bold text-white leading-none tracking-wide">FULLSHINE</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase">Detailing Premium</p>
            </div>
          </div>
          <Link href="/reservar" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-5 py-2 rounded-full transition-colors">
            Reservar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 pt-20">
        {/* Fondo negro cálido con halo ámbar — consistente con el logo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_#1c1100_0%,_#080808_100%)]" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeIn delay={0.1}>
            {/* Logo con halo ámbar */}
            <Image src="/logo.png" alt="Fullshine Detailing Premium" width={160} height={160}
              className="mx-auto mb-8 drop-shadow-[0_0_60px_rgba(233,150,13,0.35)]" />
          </FadeIn>
          <FadeUp delay={0.25}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[1.05]">
              Tu auto merece<br />
              {/* Gradiente metálico plata → blanco → plata */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-chrome-400 via-white to-chrome-300">
                brillar de verdad
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.4}>
            {/* Línea ámbar decorativa */}
            <div className="w-16 h-0.5 bg-brand-500 mx-auto mb-6 rounded-full" />
            <p className="text-chrome-500 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Detailing profesional en Concepción y San Pedro de la Paz.
              Desde un lavado completo hasta tratamiento cerámico.
            </p>
          </FadeUp>
          <FadeUp delay={0.55}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reservar"
                className="bg-brand-500 hover:bg-brand-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-brand-500/25">
                Reservar ahora
              </Link>
              <a href="#servicios"
                className="border border-chrome-700 hover:border-chrome-500 text-chrome-300 hover:text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
                Ver servicios
              </a>
            </div>
            <p className="mt-6 text-chrome-700 text-sm tracking-wide">
              Concepción y San Pedro de la Paz · Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
            </p>
          </FadeUp>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-brand-500/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-brand-500/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* TRUCK SHOWCASE */}
      <section className="relative py-0 overflow-hidden bg-gray-950">
        <ParallaxSection className="relative w-full">
          <Image src="/truck.jpg" alt="Fullshine - Camioneta brandizada"
            width={1600} height={800} className="w-full object-cover max-h-[520px]" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/30 to-transparent flex items-center">
            <div className="px-8 md:px-16 max-w-lg">
              <FadeUp delay={0.15}>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Nuestra flota</p>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                  Donde tú prefieras
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Atendemos en nuestro taller en Concepción o vamos donde estés con todo el equipamiento para un resultado profesional.
                </p>
                <div className="mt-5 flex gap-3 flex-wrap">
                  <span className="bg-white/10 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">🏠 A domicilio</span>
                  <span className="bg-white/10 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">🔧 En taller · Concepción</span>
                  <span className="bg-white/10 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">San Pedro de la Paz</span>
                </div>
              </FadeUp>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* WHY US */}
      <section className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-bold text-center mb-3">Por que Fullshine?</h2>
            <p className="text-gray-400 text-center mb-12">Detailing de calidad no es un lujo, es cuidar tu inversión.</p>
          </FadeUp>
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, i) => (
              <StaggerItem key={i}>
                <HoverCard className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-colors h-full">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-bold text-center mb-3">Nuestros servicios</h2>
            <p className="text-gray-400 text-center mb-12">Precios por tipo de vehículo. Selecciona al reservar.</p>
          </FadeUp>
          <div className="space-y-12">
            {orderedCategories.map(cat => (
              <FadeUp key={cat}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-3">
                  <span className="flex-1 h-px bg-amber-500/20" />
                  {CATEGORY_LABELS[cat] ?? cat}
                  <span className="flex-1 h-px bg-amber-500/20" />
                </h3>
                <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[cat].map(service => {
                    const prices = (service as any).prices ?? []
                    const minPrice = prices.length
                      ? Math.min(...prices.map((p: any) => p.price_clp ?? Infinity))
                      : null
                    return (
                      <StaggerItem key={service.id}>
                        <HoverCard className="bg-gray-900 border border-white/5 rounded-2xl p-5 flex justify-between items-start hover:border-white/10 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{service.name}</p>
                            {service.description && (
                              <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                            )}
                            {(service as any).duration_hours && (
                              <p className="text-gray-600 text-xs mt-1">⏱ {(service as any).duration_hours}h aprox.</p>
                            )}
                          </div>
                          <div className="ml-4 text-right shrink-0">
                            {minPrice ? (
                              <>
                                <p className="text-xs text-gray-500 mb-0.5">desde</p>
                                <p className="font-bold text-amber-400">{formatCurrency(minPrice)}</p>
                              </>
                            ) : (
                              <p className="text-gray-500 text-sm">Consultar</p>
                            )}
                          </div>
                        </HoverCard>
                      </StaggerItem>
                    )
                  })}
                </StaggerList>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2}>
            <div className="text-center mt-12">
              <Link href="/reservar"
                className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
                Reservar mi turno
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* GOOGLE REVIEWS */}
      <section className="py-24 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Lo que dicen nuestros clientes</p>
              <h2 className="text-3xl font-bold text-white mb-2">Calificados en Google</h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-4xl font-black text-white">5.0</span>
                <div className="flex gap-0.5">
                  {[0,1,2,3,4].map(i => <StarIcon key={i} />)}
                </div>
                <span className="text-gray-400 text-sm">en Google Business</span>
              </div>
            </div>
          </FadeUp>
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {REVIEWS.map((r, i) => (
              <StaggerItem key={i}>
                <HoverCard className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors h-full">
                  <div className="relative h-44 bg-gray-800 overflow-hidden">
                    <Image src={r.photo} alt={`Auto de ${r.name}`} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black text-sm shrink-0">
                        {r.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{r.name}</p>
                        <p className="text-gray-500 text-xs">{r.time}</p>
                      </div>
                      <GoogleIcon className="w-5 h-5 ml-auto shrink-0" />
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[0,1,2,3,4].map(j => <StarIcon key={j} size="sm" />)}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerList>
          <FadeUp delay={0.2}>
            <div className="text-center">
              <a href="https://share.google/CuDgbHdTZu1FF03yi" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/10 hover:border-white/25 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors">
                <GoogleIcon className="w-4 h-4" />
                Ver todas las reseñas en Google
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <FaqSection />

      {/* BUSINESS SUBSCRIPTION */}
      <section className="py-24 px-4 bg-gray-900/60 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Para empresas y flotas</p>
              <h2 className="text-3xl font-bold text-white mb-3">Suscripción empresarial</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Mantén la flota de tu empresa siempre impecable con un plan mensual a medida.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <StaggerList className="space-y-4">
              {BUSINESS_FEATURES.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
            <FadeUp delay={0.2}>
              <div className="bg-gray-950 border border-amber-500/20 rounded-2xl p-8 text-center">
                <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-amber-400 text-xs font-bold uppercase tracking-wider mb-5">
                  Plan Empresa
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Cotización personalizada. Contáctanos y te enviamos propuesta en menos de 24 horas.
                </p>
                <ul className="text-left space-y-2 mb-8">
                  {['Factura electrónica incluida', 'Técnico asignado fijo', 'Reporte mensual de servicios', 'Atención prioritaria'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-amber-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="https://wa.me/56933654943?text=Hola%2C%20me%20interesa%20el%20plan%20empresarial%20de%20Fullshine"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-full transition-colors text-sm">
                  Solicitar cotización por WhatsApp
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fullshine" width={36} height={36} className="rounded-full" />
            <div>
              <p className="font-bold text-sm text-white">FULLSHINE Detailing Premium</p>
              <a href="https://maps.google.com/?q=Camilo+Henriquez+381,+Concepci%C3%B3n" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Camilo Henríquez 381, Concepción
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            <a href="https://wa.me/56933654943" target="_blank" rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition-colors">
              +56 9 3365 4943
            </a>
            <span className="mx-2">·</span>
            <a href="mailto:fullshinechile@gmail.com" className="hover:text-gray-300 transition-colors">
              fullshinechile@gmail.com
            </a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Fullshine. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
