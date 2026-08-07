import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import { BUSINESS, buildMetadata, schemaFAQ, schemaBreadcrumb, jsonLd } from '@/lib/seo'

export const revalidate = 3600

const PATH = '/preguntas-frecuentes'

export const metadata = buildMetadata({
  title: 'Preguntas frecuentes sobre detailing y tratamiento cerámico — Fullshine Concepción',
  description:
    'Respuestas concretas sobre tratamiento cerámico, pulido, precios y proceso de detailing en Concepción. Cuánto cuesta, cuánto dura, qué incluye y cómo elegir.',
  path: PATH,
  keywords: [
    'cuánto cuesta tratamiento cerámico Concepción',
    'cuánto dura el sellado cerámico',
    'diferencia pulido y cerámico',
    'detailing precios Concepción',
  ],
})

/**
 * Hub de preguntas frecuentes.
 *
 * Escrito específicamente para ser CITABLE por motores de búsqueda con IA
 * (ChatGPT, Perplexity, Gemini, AI Overview de Google). La evidencia dice que
 * esos sistemas leen el HTML directamente y extraen respuestas que estén:
 *   · en formato pregunta → respuesta directa
 *   · con cifras concretas (precios, plazos, medidas)
 *   · sin rodeos publicitarios
 *
 * Por eso cada respuesta empieza con el dato duro y después explica.
 */

type Grupo = { titulo: string; id: string; items: { q: string; a: string }[] }

const GRUPOS: Grupo[] = [
  {
    titulo: 'Precios y presupuesto',
    id: 'precios',
    items: [
      {
        q: '¿Cuánto cuesta un tratamiento cerámico en Concepción?',
        a: 'En Fullshine el tratamiento cerámico cuesta desde $300.000 (paquete Platino), $350.000 (Gold) y $500.000 (Elite), precios en pesos chilenos. El valor final depende del tipo de vehículo y del estado de la pintura. Los tres paquetes incluyen lavado técnico, descontaminación, pulido de corrección y aplicación de cerámica Nasiol ZR53 de 10H. En el mercado de Concepción los precios van desde $80.000 hasta $600.000; la diferencia está en la concentración del producto y en si el servicio incluye o no la preparación previa de la pintura.',
      },
      {
        q: '¿Por qué hay tratamientos cerámicos tan baratos?',
        a: 'Un precio muy bajo suele indicar que se aplica un spray cerámico de baja concentración, sin preparación de la pintura. Ese tipo de producto dura entre semanas y pocos meses. Una cerámica real de 10H requiere descontaminación, corrección de pintura y varias horas de trabajo, y esa mano de obra es la mayor parte del costo.',
      },
      {
        q: '¿Cuánto hay que pagar para reservar?',
        a: 'Un anticipo del 20% del valor del servicio. El saldo se paga al retirar el vehículo. El diagnóstico previo de la pintura no tiene costo.',
      },
      {
        q: '¿El precio cambia según la comuna?',
        a: 'No. Cobramos lo mismo para clientes de Concepción, San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén. El precio varía solo por tipo de vehículo y estado de la pintura.',
      },
    ],
  },
  {
    titulo: 'Tratamiento cerámico',
    id: 'ceramico',
    items: [
      {
        q: '¿Cuánto dura un tratamiento cerámico?',
        a: 'La cerámica Nasiol ZR53 tiene 3 años de duración de fábrica, extensibles hasta 5 años aplicando el booster de mantención cada 6 meses. La duración real depende del uso del vehículo: un auto que duerme a la intemperie y se lava con métodos agresivos pierde protección más rápido que uno guardado.',
      },
      {
        q: '¿Es lo mismo tratamiento cerámico, sellado cerámico y coating?',
        a: 'Sí, son nombres distintos para el mismo servicio. También se le dice nano cerámico o cerámica. Todos describen la aplicación de una capa de dióxido de silicio (SiO₂) sobre la pintura, que endurece al curar y forma una barrera protectora contra rayos UV, contaminación química y micro-rayas.',
      },
      {
        q: '¿El tratamiento cerámico evita los rayones?',
        a: 'No los evita, los reduce. La cerámica aumenta la resistencia frente a micro-rayas del lavado cotidiano y al remolino, pero no protege contra impactos ni rayones profundos. Para eso existe el PPF, que es una película física y un producto distinto.',
      },
      {
        q: '¿Puedo aplicar cerámica sin pulir antes?',
        a: 'Técnicamente sí, pero es un error. La cerámica sella el estado actual de la pintura: si hay rayones, hologramas u oxidación, quedan encapsulados debajo de la capa protectora. Por eso todos nuestros paquetes incluyen el pulido de corrección antes de aplicar.',
      },
      {
        q: '¿Cuánto tiempo debe quedarse el auto?',
        a: 'Entre 1 y 2 días según el paquete. El Platino toma alrededor de 1 día; el Gold entre 1 y 2; el Elite hasta 2 días. El plazo lo determina el curado de la cerámica, que necesita ambiente controlado.',
      },
      {
        q: '¿Puedo mojar el auto después?',
        a: 'No durante las primeras 48 a 72 horas. Ese es el período de curado y el contacto con agua puede afectar la adherencia final de la capa.',
      },
    ],
  },
  {
    titulo: 'Pulido y estado de la pintura',
    id: 'pulido',
    items: [
      {
        q: '¿Qué diferencia hay entre pulido y tratamiento cerámico?',
        a: 'El pulido corrige: elimina rayones, hologramas y oxidación desgastando una capa mínima del barniz. El tratamiento cerámico protege: aplica una barrera sobre la pintura ya corregida. Son complementarios, no alternativas. El orden correcto es pulir primero y sellar después.',
      },
      {
        q: '¿Cuántas veces se puede pulir un auto?',
        a: 'Depende del espesor de laca que quede. La capa transparente de fábrica suele estar entre 40 y 60 micras en vehículos nuevos, y cada corrección consume entre 2 y 5 micras según la agresividad. Cuando el espesor baja demasiado, pulir deja de ser seguro. Por eso medimos antes de intervenir.',
      },
      {
        q: '¿Cómo se sabe si un auto fue repintado?',
        a: 'Midiendo el espesor con un medidor de capas. Un panel repintado marca lecturas notablemente mayores que el resto del vehículo, porque suma la pintura original más la nueva. Es un dato relevante tanto para decidir el tratamiento como al momento de comprar o vender un auto usado.',
      },
      {
        q: '¿Todos los rayones se pueden eliminar?',
        a: 'No. Los rayones que solo afectan el barniz suelen corregirse por completo. Los que llegan a la capa de color o al metal no se eliminan puliendo: requieren pintura. En el diagnóstico revisamos panel por panel bajo luz de inspección y decimos con precisión cuáles salen, cuáles se atenúan y cuáles no.',
      },
    ],
  },
  {
    titulo: 'El diagnóstico gratuito',
    id: 'diagnostico',
    items: [
      {
        q: '¿Qué incluye el diagnóstico gratuito de Fullshine?',
        a: 'Medición del espesor real de la laca con medidor profesional, revisión de la pintura bajo luz LED de inspección, detección de paneles repintados, evaluación de qué rayones son corregibles, nivel de contaminación de la superficie y estado de la protección actual. Toma entre 15 y 20 minutos, no tiene costo y no obliga a contratar nada.',
      },
      {
        q: '¿Por qué es gratis?',
        a: 'Porque preferimos que el cliente decida con datos. Un diagnóstico honesto a veces significa perder una venta, cuando el auto no necesita el tratamiento, pero gana un cliente que vuelve y que recomienda. Es una decisión comercial.',
      },
      {
        q: '¿Tengo que lavar el auto antes de ir?',
        a: 'No. Tráelo como esté. El estado real de la pintura es justamente lo que necesitamos evaluar.',
      },
    ],
  },
  {
    titulo: 'Taller, horarios y ubicación',
    id: 'taller',
    items: [
      {
        q: '¿Dónde queda Fullshine Detailing?',
        a: `En ${BUSINESS.street}, ${BUSINESS.city}, Región del Biobío, Chile. Es un taller cerrado con iluminación LED hexagonal de inspección. Atendemos también a clientes de San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén.`,
      },
      {
        q: '¿Cuál es el horario de atención?',
        a: 'Lunes a viernes de 09:00 a 18:00 y sábados de 09:00 a 14:00, siempre con hora reservada previamente. No atendemos por orden de llegada porque trabajamos un vehículo a la vez.',
      },
      {
        q: '¿Cómo se reserva una hora?',
        a: `Por el sitio web en fullshine.autos/reservar, o por WhatsApp al ${BUSINESS.phoneDisplay}. La reserva online toma menos de un minuto y la confirmación llega de inmediato por WhatsApp.`,
      },
      {
        q: '¿Atienden vehículos de alta gama?',
        a: 'Sí. Trabajamos regularmente con vehículos premium y deportivos. El proceso es el mismo para todos: medición de espesor, evaluación bajo luz de inspección y recomendación basada en los datos.',
      },
    ],
  },
  {
    titulo: 'Garantía y mantención',
    id: 'garantia',
    items: [
      {
        q: '¿Qué garantía entrega Fullshine?',
        a: 'Cada tratamiento cerámico incluye un certificado digital con código único verificable en línea, que registra la fecha de aplicación y el vencimiento de la cobertura. La garantía base es de 3 años y se extiende hasta 5 aplicando la mantención semestral.',
      },
      {
        q: '¿En qué consiste la mantención semestral?',
        a: 'Es la aplicación del booster cerámico cada 6 meses, que restituye la hidrofobia y el brillo de la capa protectora. Hay dos formatos: Essential ($107.088) y Signature ($178.488), ambos con precio único sin importar el tipo de vehículo. Es la condición para mantener vigente la garantía extendida.',
      },
      {
        q: '¿Cómo debo lavar un auto con tratamiento cerámico?',
        a: 'Con método de dos baldes, guante de microfibra y shampoo de pH neutro. Evita los lavados automáticos de rodillos y los productos con desengrasantes agresivos, que degradan la capa cerámica antes de tiempo.',
      },
    ],
  },
]

const MIGAS = [
  { name: 'Inicio', path: '/' },
  { name: 'Preguntas frecuentes', path: PATH },
]

const TODAS = GRUPOS.flatMap(g => g.items)

export default function PreguntasFrecuentes() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schemaFAQ(TODAS), schemaBreadcrumb(MIGAS))}
      />
      <SiteNav />

      <main>
        <section className="pt-32 pb-10 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs items={MIGAS} />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Preguntas frecuentes
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Respuestas concretas sobre detailing, tratamiento cerámico y corrección de pintura
              en Concepción. Con precios reales y sin rodeos.
            </p>

            <nav aria-label="Índice de secciones" className="mt-8 flex flex-wrap gap-2">
              {GRUPOS.map(g => (
                <a key={g.id} href={`#${g.id}`}
                  className="rounded-full border border-white/10 bg-gray-900/60 px-4 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:border-amber-500/40 hover:text-amber-400">
                  {g.titulo}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {GRUPOS.map(g => (
          <section key={g.id} id={g.id} className="scroll-mt-24 px-4 py-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black mb-6 text-amber-400">{g.titulo}</h2>
              <div className="space-y-5">
                {g.items.map(item => (
                  <article key={item.q} className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                    <h3 className="font-bold text-white mb-3 leading-snug">{item.q}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">¿Tu pregunta no está acá?</h2>
            <p className="text-gray-400 mb-8">
              Escríbenos por WhatsApp o ven al diagnóstico gratuito y lo vemos con tu auto delante.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/diagnostico"
                className="rounded-full bg-amber-500 px-8 py-4 font-black text-black transition-all hover:scale-105 hover:bg-amber-400">
                Diagnóstico gratuito
              </Link>
              <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition-colors hover:border-white/40">
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
