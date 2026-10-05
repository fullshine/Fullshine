'use client'

import { useState } from 'react'

interface Props {
  text: string
  className?: string
  tone?: 'light' | 'dark'
}

// Parsea "Exterior: ... Interior: ..." en secciones etiquetadas
function parseSections(text: string) {
  const sectionRegex = /(Exterior|Interior|Incluye|Proceso):\s*/gi
  const parts = text.split(sectionRegex)
  if (parts.length <= 1) return null // sin secciones, texto plano

  const sections: { label: string; content: string }[] = []
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ label: parts[i], content: parts[i + 1]?.trim() ?? '' })
  }
  return sections
}

export default function ServiceDescription({ text, className = '', tone = 'light' }: Props) {
  const [expanded, setExpanded] = useState(false)

  const textColor = tone === 'dark' ? 'text-gray-300' : 'text-gray-500'
  const labelColor = tone === 'dark' ? 'text-gray-100' : 'text-gray-700'
  const linkColor = tone === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-400'
  const SHORT_LIMIT = 90
  const isLong = text.length > SHORT_LIMIT
  const sections = parseSections(text)

  return (
    <span className={className}>
      {!expanded ? (
        <>
          <span className={`${textColor} text-sm leading-relaxed`}>
            {isLong ? text.substring(0, SHORT_LIMIT).trimEnd() + '…' : text}
          </span>
          {isLong && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(true) }}
              className={`ml-1 ${linkColor} text-sm font-semibold`}
            >
              ver más
            </button>
          )}
        </>
      ) : (
        <>
          {sections ? (
            <span className="block mt-1 space-y-1">
              {sections.map(s => (
                <span key={s.label} className="block text-sm">
                  <span className={`font-semibold ${labelColor}`}>{s.label}: </span>
                  <span className={textColor}>{s.content}</span>
                </span>
              ))}
            </span>
          ) : (
            <span className={`${textColor} text-sm leading-relaxed`}>{text}</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(false) }}
            className={`ml-1 ${linkColor} text-sm font-semibold`}
          >
            ver menos
          </button>
        </>
      )}
    </span>
  )
}
