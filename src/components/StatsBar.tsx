'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 300, suffix: '+', label: 'Autos sellados', icon: '🚗' },
  { value: 4,   suffix: ' años', label: 'De experiencia', icon: '📅' },
  { value: 5.0, suffix: '★', label: 'En Google Reviews', icon: '⭐', decimals: 1 },
  { value: 100, suffix: '%', label: 'Clientes satisfechos', icon: '😊' },
]

function Counter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 1500
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(parseFloat(current.toFixed(decimals)))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target, decimals])

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  )
}

export default function StatsBar() {
  return (
    <section className="py-14 px-4 bg-gray-950 border-y border-white/5">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-3xl md:text-4xl font-black text-amber-400 tabular-nums">
              <Counter target={s.value} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
