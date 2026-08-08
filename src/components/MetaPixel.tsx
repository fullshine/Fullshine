'use client'

import Script from 'next/script'
import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { META_PIXEL_ID, track } from '@/lib/fbq'

/**
 * Pixel de Meta.
 *
 * Se activa solo si existe NEXT_PUBLIC_META_PIXEL_ID (se configura en Vercel).
 * En desarrollo local, sin la variable, no carga nada.
 *
 * Next.js con App Router no recarga la página al navegar, así que
 * disparamos PageView manualmente en cada cambio de ruta.
 */
function PixelPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const primeraCarga = useRef(true)

  useEffect(() => {
    // El script base ya dispara el PageView de la carga inicial.
    // Sin esta guarda se enviaba DOS veces, inflando las métricas y
    // ensuciando la optimización de las campañas.
    if (primeraCarga.current) {
      primeraCarga.current = false
      return
    }
    track('PageView')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return null
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) return null

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      {/* useSearchParams necesita un límite de Suspense en el App Router */}
      <Suspense fallback={null}>
        <PixelPageViews />
      </Suspense>
    </>
  )
}
