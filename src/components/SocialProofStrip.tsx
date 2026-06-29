'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  {
    text: 'El lavado y pulido dejó el auto como nuevo, hasta sacó manchas de pintura de topones. El dueño amable, explicó paso a paso lo que iba realizando.',
    name: 'Jorge Bizama',
    avatar: 'J',
  },
  {
    text: 'Hace 3 años llevé mi auto a Fullshine y tuve una muy buena experiencia, por lo que volví a contratar sus servicios luego de un cambio de vehículo. Quedé encantada.',
    name: 'Cata Mayorga',
    avatar: 'C',
  },
  {
    text: 'Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.',
    name: 'Jonathan Ramírez',
    avatar: 'J',
  },
]

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function SocialProofStrip() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % QUOTES.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const q = QUOTES[current]

  return (
    <div className="bg-midnight-800 border-y border-white/5 py-8 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center gap-0.5 mb-3">
          {[0,1,2,3,4].map(i => <StarIcon key={i} />)}
        </div>
        <p
          className="text-chrome-200 text-lg md:text-xl font-medium leading-relaxed mb-4 transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          &ldquo;{q.text}&rdquo;
        </p>
        <div
          className="flex items-center justify-center gap-3 transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-black text-xs">
            {q.avatar}
          </div>
          <p className="text-chrome-500 text-sm">
            <span className="text-white font-semibold">{q.name}</span> · Cliente verificado en Google
          </p>
          <GoogleIcon />
        </div>
        {/* Indicadores */}
        <div className="flex justify-center gap-1.5 mt-5">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true) }, 400) }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-brand-500' : 'bg-chrome-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
