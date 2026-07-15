'use client'

import { useState } from 'react'

interface Props {
  text: string
  className?: string
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

export default function ServiceDescription({ text, className = '' }: Props) {
  const [expanded, setExpanded] = useState(false)

  const SHORT_LIMIT = 90
  const isLong = text.length > SHORT_LIMIT
  const sections = parseSections(text)

  return (
    <span className={className}>
      {!expanded ? (
        <>
          <span className="text-gray-500 text-sm">
            {isLong ? text.substring(0, SHORT_LIMIT).trimEnd() + '…' : text}
          </span>
          {isLong && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(true) }}
              className="ml-1 text-amber-500 hover:text-amber-400 text-xs font-semibold"
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
                  <span className="font-semibold text-gray-700">{s.label}: </span>
                  <span className="text-gray-500">{s.content}</span>
                </span>
              ))}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">{text}</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(false) }}
            className="ml-1 text-amber-500 hover:text-amber-400 text-xs font-semibold"
          >
            ver menos
          </button>
        </>
      )}
    </span>
  )
}
