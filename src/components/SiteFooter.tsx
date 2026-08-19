import Link from 'next/link'
import Image from 'next/image'
import { BUSINESS, COMUNAS } from '@/lib/seo'

/**
 * Footer con enlazado interno completo.
 *
 * Antes solo tenía datos de contacto. Un footer con enlaces a todas las páginas
 * de servicio y de comuna distribuye autoridad hacia ellas desde cada página del
 * sitio, que es la forma más barata de fortalecer las URLs que quieres posicionar.
 */

const SERVICIOS = [
  { href: '/sellado-ceramico-concepcion', label: 'Tratamiento cerámico' },
  { href: '/pulido-auto-concepcion', label: 'Pulido y corrección' },
  { href: '/lavado-detallado-concepcion', label: 'Lavado detallado' },
  { href: '/lavado-tapiz-concepcion', label: 'Limpieza de tapiz' },
  { href: '/diagnostico', label: 'Diagnóstico gratuito' },
]

const ZONAS = [
  { href: '/detailing-concepcion', label: 'Detailing en Concepción' },
  { href: '/detailing-san-pedro-de-la-paz', label: 'Detailing en San Pedro de la Paz' },
  { href: '/revision-gratis-concepcion', label: 'Revisión gratis Concepción' },
]

const RECURSOS = [
  { href: '/preguntas-frecuentes', label: 'Preguntas frecuentes' },
  { href: '/blog', label: 'Blog' },
  { href: '/nosotros', label: 'Quiénes somos' },
  { href: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' },
  { href: '/reservar', label: 'Reservar hora' },
  { href: '/politica-privacidad', label: 'Política de privacidad' },
]

function Columna({ titulo, items }: { titulo: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{titulo}</h2>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.href}>
            <Link href={i.href} className="text-sm text-gray-500 hover:text-amber-400 transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SiteFooter() {
  const mapa = `https://maps.google.com/?q=${encodeURIComponent(`${BUSINESS.street}, ${BUSINESS.city}`)}`

  return (
    <footer className="border-t border-white/5 bg-gray-950 px-4 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identidad + NAP */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Logo de Fullshine Detailing Premium"
                width={40} height={40} className="rounded-full" />
              <p className="font-bold text-sm text-white leading-tight">
                FULLSHINE<br />
                <span className="font-normal text-gray-400">Detailing Premium</span>
              </p>
            </div>

            <address className="not-italic space-y-1.5 text-sm text-gray-500">
              <a href={mapa} target="_blank" rel="noopener noreferrer"
                className="block hover:text-gray-300 transition-colors">
                {BUSINESS.street}<br />{BUSINESS.city}, {BUSINESS.region}
              </a>
              <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="block text-amber-500 hover:text-amber-400 transition-colors font-medium">
                {BUSINESS.phoneDisplay}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="block hover:text-gray-300 transition-colors">
                {BUSINESS.email}
              </a>
            </address>

            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              Lun a Vie 09:00–18:00<br />
              Sáb 09:00–14:00
            </p>
          </div>

          <Columna titulo="Servicios" items={SERVICIOS} />
          <Columna titulo="Dónde atendemos" items={ZONAS} />
          <Columna titulo="Fullshine" items={RECURSOS} />
        </div>

        {/* Comunas — refuerzo de SEO local, sin relleno */}
        <p className="mt-12 pt-8 border-t border-white/5 text-xs text-gray-600 leading-relaxed">
          Atendemos vehículos de {COMUNAS.slice(0, -1).join(', ')} y {COMUNAS[COMUNAS.length - 1]},
          en la Región del Biobío, Chile.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} {BUSINESS.name}. Todos los derechos reservados.
          </p>
          <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer"
            aria-label="Instagram de Fullshine Detailing Premium"
            className="text-xs text-gray-600 hover:text-amber-400 transition-colors">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
