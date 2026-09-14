'use client'

/**
 * Último recurso: se activa cuando falla el propio layout raíz, donde
 * `error.tsx` ya no alcanza a montarse. Por eso tiene que traer sus propias
 * etiquetas html y body, y no puede depender de Tailwind ni de ningún
 * componente del proyecto.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es-CL">
      <body style={{
        margin: 0, minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#111827', padding: 16,
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          maxWidth: 400, width: '100%', textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#9ca3af', margin: 0, textTransform: 'uppercase' }}>
            Fullshine Detailing
          </p>

          <h1 style={{ fontSize: 20, color: '#111827', margin: '12px 0' }}>
            El sitio no está disponible
          </h1>

          <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: '0 0 20px' }}>
            Estamos con un problema técnico. Escríbenos por WhatsApp y te
            atendemos igual.
          </p>

          <a
            href="https://wa.me/56933654943"
            style={{
              display: 'block', padding: '12px 0', borderRadius: 8,
              background: '#22c55e', color: '#fff', fontWeight: 600,
              textDecoration: 'none', marginBottom: 8,
            }}
          >
            Escribir por WhatsApp
          </a>

          <a
            href="tel:+56933654943"
            style={{
              display: 'block', padding: '12px 0', borderRadius: 8,
              border: '1px solid #d1d5db', color: '#374151',
              textDecoration: 'none', marginBottom: 8,
            }}
          >
            +56 9 3365 4943
          </a>

          <button
            onClick={reset}
            style={{
              background: 'none', border: 'none', color: '#6b7280',
              fontSize: 13, cursor: 'pointer', padding: 8,
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
