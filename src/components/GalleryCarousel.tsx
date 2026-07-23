'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface Slide {
  src: string
  alt: string
}

// Para agregar/cambiar fotos: deja los archivos en /public/galeria/ como trabajo-N.jpg
const SLIDES: Slide[] = [
  { src: '/galeria/trabajo-1.jpg', alt: 'Auto con sellado cerámico Nasiol ZR53 en Fullshine Concepción' },
  { src: '/galeria/trabajo-2.jpg', alt: 'Detailing premium con cerámica en Fullshine Concepción' },
  { src: '/galeria/trabajo-3.jpg', alt: 'Auto con tratamiento cerámico y pulido en Fullshine' },
  { src: '/galeria/trabajo-4.jpg', alt: 'Vehículo con protección cerámica en Fullshine Concepción' },
  { src: '/galeria/trabajo-5.jpg', alt: 'Sellado cerámico profesional en Fullshine Concepción' },
  { src: '/galeria/trabajo-6.jpg', alt: 'Auto premium detallado en Fullshine Concepción' },
]

const INTERVAL = 4000 // ms entre fotos

export default function GalleryCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((n: number) => {
    setIndex(prev => (n + SLIDES.length) % SLIDES.length)
  }, [])

  // Auto-rotación
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex(prev => (prev + 1) % SLIDES.length), INTERVAL)
    return () => clearInterval(id)
  }, [paused])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) go(diff > 0 ? index - 1 : index + 1)
    touchStartX.current = null
  }

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Viewport */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gray-900">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Flechas */}
        <button
          onClick={() => go(index - 1)}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Foto siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors"
        >
          ›
        </button>
      </div>

      {/* Puntos */}
      <div className="flex justify-center gap-2 mt-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ir a la foto ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-amber-500' : 'w-2 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
