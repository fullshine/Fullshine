export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
  category: string
  image?: string
}

export const POSTS: BlogPost[] = [
  {
    slug: 'cuanto-cuesta-sellado-ceramico-concepcion',
    title: '¿Cuánto cuesta el sellado cerámico en Concepción? Guía de precios 2026',
    description: 'Precios reales del sellado cerámico en Concepción y San Pedro de la Paz: qué incluye cada paquete, de qué depende el costo y cómo no caer en el precio más barato.',
    date: '2026-07-01',
    readingTime: '6 min',
    category: 'Cerámico',
  },
  {
    slug: 'pulido-vs-ceramico-auto',
    title: 'Pulido vs sellado cerámico: ¿cuál necesita tu auto?',
    description: 'Diferencia real entre pulido y sellado cerámico. Cuándo usar cada uno, si se pueden combinar y cuál es más conveniente según el estado de tu pintura.',
    date: '2026-07-08',
    readingTime: '5 min',
    category: 'Pintura',
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}
