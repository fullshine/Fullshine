import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fullshine Detailing | Concepción & San Pedro de la Paz',
  description: 'Reserva tu servicio de detailing profesional en Concepción & San Pedro de la Paz, Chile.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
