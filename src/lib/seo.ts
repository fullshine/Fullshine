import type { Metadata } from 'next'

/**
 * Fuente única de verdad para SEO.
 *
 * Todos los datos del negocio (NAP), la configuración de metadata y los
 * generadores de Schema.org viven acá. Si cambia un dato — dirección,
 * teléfono, horario, número de reseñas — se cambia UNA vez en este archivo
 * y se propaga a todo el sitio.
 *
 * La consistencia del NAP (Name, Address, Phone) entre el sitio, Google
 * Business Profile y los directorios es uno de los factores más fuertes
 * del posicionamiento local.
 */

export const SITE_URL = 'https://www.fullshine.autos'

export const BUSINESS = {
  name: 'Fullshine Detailing Premium',
  legalName: 'Fullshine Detailing Premium',
  shortName: 'Fullshine',
  slogan: 'Diagnosticamos antes de intervenir',
  description:
    'Taller de detailing automotriz premium en Concepción. Especialistas en tratamiento cerámico Nasiol ZR53, corrección de pintura con medición de espesor de laca, lavado detallado y limpieza de tapiz. Atendemos Concepción, San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén.',
  phone: '+56933654943',
  phoneDisplay: '+56 9 3365 4943',
  whatsapp: '56933654943',
  email: 'fullshinechile@gmail.com',
  street: 'Camilo Henríquez 381',
  city: 'Concepción',
  region: 'Región del Biobío',
  regionCode: 'BI',
  postalCode: '4030000',
  country: 'CL',
  // ⚠️ Coordenadas aproximadas del centro de Concepción.
  // Reemplázalas por las exactas de tu ficha de Google Business Profile:
  // abre tu negocio en Google Maps → clic derecho sobre el pin → copiar coordenadas.
  latitude: -36.8270,
  longitude: -73.0498,
  priceRange: '$$$',
  foundingYear: 2019,
  ratingValue: '5',
  reviewCount: '82',
  instagram: 'https://www.instagram.com/fullshinespp',
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/galeria/hero-ferrari.jpg`,
} as const

/** Comunas donde se presta servicio. Alimenta areaServed y el SEO local. */
export const COMUNAS = [
  'Concepción',
  'San Pedro de la Paz',
  'Chiguayante',
  'Talcahuano',
  'Hualpén',
] as const

export const HORARIOS = [
  { dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '09:00', cierra: '18:00' },
  { dias: ['Saturday'], abre: '09:00', cierra: '14:00' },
] as const

// ── Metadata ────────────────────────────────────────────────────────────────

/**
 * Genera la metadata de una página con todos los campos que importan:
 * canonical, Open Graph, Twitter Card y keywords.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  image = BUSINESS.image,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  noindex?: boolean
}): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS.name,
      locale: 'es_CL',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

// ── Schema.org ──────────────────────────────────────────────────────────────

const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: BUSINESS.street,
  addressLocality: BUSINESS.city,
  addressRegion: BUSINESS.region,
  postalCode: BUSINESS.postalCode,
  addressCountry: BUSINESS.country,
}

const GEO = {
  '@type': 'GeoCoordinates',
  latitude: BUSINESS.latitude,
  longitude: BUSINESS.longitude,
}

const OPENING_HOURS = HORARIOS.map(h => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: h.dias,
  opens: h.abre,
  closes: h.cierra,
}))

const AREA_SERVED = COMUNAS.map(c => ({
  '@type': 'City',
  name: c,
  containedInPlace: { '@type': 'AdministrativeArea', name: 'Región del Biobío' },
}))

/**
 * Entidad principal del negocio. Se declara una sola vez en el layout con un
 * @id estable, y el resto de los schemas la referencian en vez de repetirla.
 * Eso evita entidades duplicadas y le da a Google un grafo limpio.
 */
export function schemaLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': ['AutoRepair', 'AutomotiveBusiness', 'LocalBusiness'],
    '@id': `${SITE_URL}/#business`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    alternateName: BUSINESS.shortName,
    slogan: BUSINESS.slogan,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    foundingDate: String(BUSINESS.foundingYear),
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: 'CLP',
    paymentAccepted: 'Efectivo, Transferencia, Tarjeta de crédito, Tarjeta de débito',
    address: POSTAL_ADDRESS,
    geo: GEO,
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${BUSINESS.street}, ${BUSINESS.city}`)}`,
    openingHoursSpecification: OPENING_HOURS,
    areaServed: AREA_SERVED,
    logo: { '@type': 'ImageObject', url: BUSINESS.logo },
    image: [BUSINESS.image, BUSINESS.logo],
    sameAs: [BUSINESS.instagram],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BUSINESS.ratingValue,
      reviewCount: BUSINESS.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    knowsAbout: [
      'Tratamiento cerámico automotriz',
      'Corrección de pintura',
      'Medición de espesor de laca',
      'Detailing automotriz',
      'Descontaminación de pintura',
      'Limpieza de tapiz',
    ],
  }
}

/** Organización, para el panel de conocimiento y las IA generativas. */
export function schemaOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: BUSINESS.logo, width: 512, height: 512 },
    description: BUSINESS.description,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    address: POSTAL_ADDRESS,
    sameAs: [BUSINESS.instagram],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'customer service',
      areaServed: 'CL',
      availableLanguage: ['Spanish'],
    },
  }
}

/** WebSite + SearchAction: habilita el cuadro de búsqueda en Google. */
export function schemaWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    description: BUSINESS.description,
    inLanguage: 'es-CL',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Servicio individual, enlazado a la entidad del negocio. */
export function schemaService({
  name,
  description,
  path,
  serviceType,
  alternateName = [],
  offers = [],
}: {
  name: string
  description: string
  path: string
  serviceType: string
  alternateName?: string[]
  offers?: { name: string; price: number }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name,
    alternateName: alternateName.length ? alternateName : undefined,
    serviceType,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@id': `${SITE_URL}/#business` },
    areaServed: AREA_SERVED,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${SITE_URL}/reservar`,
      servicePhone: BUSINESS.phone,
      serviceLocation: { '@id': `${SITE_URL}/#business` },
    },
    offers: offers.length
      ? offers.map(o => ({
          '@type': 'Offer',
          name: o.name,
          priceCurrency: 'CLP',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: o.price,
            priceCurrency: 'CLP',
          },
          availability: 'https://schema.org/InStock',
          areaServed: AREA_SERVED,
        }))
      : undefined,
  }
}

/** Preguntas frecuentes. Puede ganar el bloque desplegable en resultados. */
export function schemaFAQ(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** Migas de pan. Mejora cómo se ve la URL en los resultados. */
export function schemaBreadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

/** Inserta uno o varios bloques JSON-LD. */
export function jsonLd(...schemas: object[]) {
  return {
    __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
  }
}
