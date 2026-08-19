import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Sitemap.
 *
 * Solo se incluyen páginas indexables. Quedan fuera /reservar (noindex),
 * las landings de campaña (/diagnostico, /oferta-tratamiento-ceramico),
 * /admin y /api.
 *
 * La prioridad refleja la importancia comercial real, no un valor arbitrario.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL
  const hoy = new Date()

  const paginas: { path: string; priority: number; freq: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
    // Portada
    { path: '',                                    priority: 1.0,  freq: 'weekly'  },

    // Páginas de zona — objetivo principal de SEO local
    { path: '/detailing-concepcion',               priority: 0.95, freq: 'weekly'  },
    { path: '/detailing-san-pedro-de-la-paz',      priority: 0.95, freq: 'weekly'  },

    // Servicios
    { path: '/sellado-ceramico-concepcion',        priority: 0.9,  freq: 'weekly'  },
    { path: '/pulido-auto-concepcion',             priority: 0.85, freq: 'monthly' },
    { path: '/lavado-detallado-concepcion',        priority: 0.85, freq: 'monthly' },
    { path: '/lavado-tapiz-concepcion',            priority: 0.85, freq: 'monthly' },
    { path: '/revision-gratis-concepcion',         priority: 0.9,  freq: 'monthly' },

    // Confianza y contenido citable por motores de IA
    { path: '/preguntas-frecuentes',               priority: 0.85, freq: 'monthly' },
    { path: '/nosotros',                           priority: 0.7,  freq: 'monthly' },
    { path: '/trabaja-con-nosotros',               priority: 0.5,  freq: 'monthly' },

    // Contenido
    { path: '/blog',                                priority: 0.8,  freq: 'weekly'  },
    { path: '/blog/cuanto-cuesta-sellado-ceramico-concepcion', priority: 0.75, freq: 'monthly' },
    { path: '/blog/pulido-vs-ceramico-auto',        priority: 0.75, freq: 'monthly' },

    // Legal
    { path: '/politica-privacidad',                 priority: 0.2,  freq: 'yearly'  },
  ]

  return paginas.map(p => ({
    url: `${base}${p.path}`,
    lastModified: hoy,
    changeFrequency: p.freq,
    priority: p.priority,
  }))
}
