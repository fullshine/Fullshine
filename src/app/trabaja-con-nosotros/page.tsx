import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import PostulacionForm from '@/components/PostulacionForm'
import { BUSINESS, SITE_URL, buildMetadata, schemaBreadcrumb, jsonLd } from '@/lib/seo'

export const revalidate = 3600

const PATH = '/trabaja-con-nosotros'

export const metadata = buildMetadata({
  title: 'Trabaja con nosotros | Fullshine Detailing Premium, Concepción',
  description:
    'Únete al equipo de Fullshine en Concepción. Buscamos personas prolijas y con ganas de aprender detailing automotriz. Envía tu currículum en línea.',
  path: PATH,
  keywords: [
    'trabajo detailing Concepción',
    'empleo lavado de autos Concepción',
    'trabajar en Fullshine',
  ],
})

const BUSCAMOS = [
  {
    t: 'Prolijidad por sobre experiencia',
    d: 'La técnica se enseña. La obsesión por el detalle no. Si eres de los que revisa dos veces antes de dar algo por terminado, nos interesa hablar contigo aunque nunca hayas trabajado en el rubro.',
  },
  {
    t: 'Ganas reales de aprender',
    d: 'Trabajamos con productos, instrumentos y procesos técnicos. Vas a aprender a medir espesor de laca, corregir pintura y aplicar cerámicos. Eso requiere curiosidad y paciencia.',
  },
  {
    t: 'Trato honesto con el cliente',
    d: 'Acá no se le vende a nadie lo que no necesita. Si un auto no requiere un tratamiento, se le dice. Esa forma de trabajar no es negociable.',
  },
  {
    t: 'Responsabilidad con los horarios',
    d: 'Los clientes reservan hora y confían en que su vehículo estará listo cuando dijimos. Cumplir plazos es parte central del trabajo.',
  },
]

const OFRECEMOS = [
  'Formación técnica real en detailing, corrección de pintura y tratamientos cerámicos',
  'Taller propio en Concepción centro, cerrado y equipado con iluminación de inspección',
  'Trabajo con vehículos de todas las gamas, incluidos premium y deportivos',
  'Contrato formal y horarios definidos: lunes a viernes 09:00–18:00, sábados 09:00–14:00',
  'Un equipo chico donde tu trabajo se nota y se reconoce',
]

const MIGAS = [
  { name: 'Inicio', path: '/' },
  { name: 'Trabaja con nosotros', path: PATH },
]

export default function TrabajaConNosotros() {
  const schemaPagina = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PATH}#webpage`,
    name: 'Trabaja con nosotros — Fullshine Detailing Premium',
    url: `${SITE_URL}${PATH}`,
    description:
      'Postula al equipo de Fullshine Detailing Premium en Concepción, Región del Biobío.',
    about: { '@id': `${SITE_URL}/#business` },
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schemaPagina, schemaBreadcrumb(MIGAS))}
      />
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="pt-32 pb-14 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs items={MIGAS} />
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
              Únete al equipo
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Trabaja con nosotros
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Somos un taller chico que hace las cosas bien. Si te gusta trabajar
              con las manos, aprender oficio técnico y ver resultados concretos al
              final del día, queremos conocerte.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              No exigimos experiencia previa en detailing. Sí exigimos prolijidad.
            </p>
          </div>
        </section>

        {/* QUÉ BUSCAMOS */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-10">Qué buscamos</h2>
            <div className="space-y-6">
              {BUSCAMOS.map(b => (
                <article key={b.t} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
                  <h3 className="mb-2.5 text-lg font-bold text-amber-400">{b.t}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{b.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* QUÉ OFRECEMOS */}
        <section className="py-16 px-4 bg-gray-900/40 border-y border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-8">Qué ofrecemos</h2>
            <ul className="space-y-4">
              {OFRECEMOS.map(o => (
                <li key={o} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-400">
                    ✓
                  </span>
                  <span className="text-gray-300 leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FORMULARIO */}
        <section id="postular" className="scroll-mt-20 py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-3">Envía tu postulación</h2>
            <p className="text-gray-400 mb-10">
              Toma dos minutos. Si tu perfil calza, te escribimos por WhatsApp.
            </p>
            <PostulacionForm />
          </div>
        </section>

        {/* CIERRE */}
        <section className="py-14 px-4 text-center border-t border-white/5">
          <p className="text-sm text-gray-500">
            ¿Prefieres entregar tu currículum en persona? Pasa por{' '}
            <span className="text-gray-300">{BUSINESS.street}, {BUSINESS.city}</span>,
            de lunes a viernes entre 09:00 y 18:00.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
