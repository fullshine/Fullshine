import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * robots.txt
 *
 * Se bloquean el panel, la API y las landings de campaña pagada, que no deben
 * competir en orgánico con las páginas de servicio.
 *
 * Los rastreadores de IA (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
 * quedan explícitamente permitidos: queremos que ChatGPT, Perplexity y Gemini
 * puedan leer y citar el sitio cuando alguien pregunte por detailing en
 * Concepción. Es tráfico de descubrimiento que hoy casi nadie está capturando.
 */
export default function robots(): MetadataRoute.Robots {
  const bloqueadas = [
    '/admin/',
    '/api/',
    '/reservar',
    '/login',
    '/certificado/',
    '/diagnostico',
    '/oferta-tratamiento-ceramico',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: bloqueadas },
      // Rastreadores de motores de búsqueda con IA — permitidos a propósito
      { userAgent: 'GPTBot',          allow: '/', disallow: bloqueadas },
      { userAgent: 'OAI-SearchBot',   allow: '/', disallow: bloqueadas },
      { userAgent: 'ChatGPT-User',    allow: '/', disallow: bloqueadas },
      { userAgent: 'PerplexityBot',   allow: '/', disallow: bloqueadas },
      { userAgent: 'ClaudeBot',       allow: '/', disallow: bloqueadas },
      { userAgent: 'Google-Extended', allow: '/', disallow: bloqueadas },
      { userAgent: 'Applebot',        allow: '/', disallow: bloqueadas },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
