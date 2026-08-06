import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import WhatsAppButton from '@/components/WhatsAppButton'
import MetaPixel from '@/components/MetaPixel'
import {
  SITE_URL, BUSINESS,
  schemaLocalBusiness, schemaOrganization, schemaWebSite, jsonLd,
} from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  // metadataBase permite usar rutas relativas en OG/Twitter en todas las páginas
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fullshine Detailing Premium | Detailing y Tratamiento Cerámico en Concepción',
    template: '%s | Fullshine Detailing Premium',
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.name, url: SITE_URL }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  category: 'Automotive',
  keywords: [
    'detailing Concepción',
    'detailing San Pedro de la Paz',
    'tratamiento cerámico Concepción',
    'pulido automotriz Concepción',
    'lavado premium Concepción',
    'lavado de tapiz Concepción',
    'coating cerámico Concepción',
    'estética automotriz Biobío',
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { 'es-CL': SITE_URL },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'bmBwZgsCrhDaMSV5wiXED3PXRpxGhkuYGfkd_uqzDCw',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fullshine',
  },
  formatDetection: { telephone: true, address: true },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  // maximumScale y userScalable se eliminaron: bloquear el zoom es una
  // barrera de accesibilidad (WCAG 1.4.4) y Lighthouse lo penaliza.
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <head>
        {/* Conexiones anticipadas a los orígenes de terceros que sí usamos.
            Ahorran el handshake DNS+TLS cuando el recurso se solicita. */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />

        {/* Grafo de entidades del sitio. Se declara una sola vez acá y el
            resto de las páginas lo referencia por @id, evitando duplicados. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(
            schemaLocalBusiness(),
            schemaOrganization(),
            schemaWebSite()
          )}
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
        <WhatsAppButton />
        <MetaPixel />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
