'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-reveal ligero con IntersectionObserver (sin librerías).
 * Respeta prefers-reduced-motion por accesibilidad.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setVisible(true); return }

    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/** Contador animado que arranca al entrar en pantalla. Accesible: aria-label con el valor final. */
export function CountUp({
  to,
  decimals = 0,
  suffix = '',
  duration = 1400,
  className = '',
}: {
  to: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(to) // SSR muestra el valor final

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (reduce || !el) return

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(parseFloat((to * eased).toFixed(decimals)))
        if (p < 1) requestAnimationFrame(tick)
      }
      setVal(0)
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })

    obs.observe(el)
    return () => obs.disconnect()
  }, [to, decimals, duration])

  const finalText = `${to.toFixed(decimals)}${suffix}`
  return (
    <span ref={ref} className={className} aria-label={finalText}>
      <span aria-hidden="true">{val.toFixed(decimals)}{suffix}</span>
    </span>
  )
}
