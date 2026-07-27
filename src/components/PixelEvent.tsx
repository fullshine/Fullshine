'use client'

import { useEffect, useRef } from 'react'
import { track, type MetaEvent } from '@/lib/fbq'

/**
 * Dispara un evento del Pixel de Meta al montar la página.
 * Sirve para marcar landings de campaña (ViewContent) desde Server Components.
 *
 * Uso:  <PixelEvent event="ViewContent" contentName="Landing diagnóstico" />
 */
export default function PixelEvent({
  event,
  contentName,
  contentCategory,
  value,
}: {
  event: MetaEvent
  contentName?: string
  contentCategory?: string
  value?: number
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    track(event, {
      content_name: contentName,
      content_category: contentCategory,
      currency: 'CLP',
      value: value ?? 0,
    })
  }, [event, contentName, contentCategory, value])

  return null
}

/**
 * Enlace a WhatsApp que registra un evento Contact antes de salir.
 * Se puede usar dentro de Server Components.
 */
export function WhatsAppTrackedLink({
  href,
  children,
  className,
  source,
}: {
  href: string
  children: React.ReactNode
  className?: string
  source: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track('Contact', { content_name: source })}
    >
      {children}
    </a>
  )
}
