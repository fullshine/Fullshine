'use client'

import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef, ReactNode } from 'react'

// Fade + slide up on scroll
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
      transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Stagger wrapper — children animate in sequence
export function StaggerList({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={isInView || reduceMotion ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: reduceMotion ? 0 : staggerDelay } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 1, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Card with lift + border glow on hover
export function HoverCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Parallax wrapper for images — moves at half scroll speed
export function ParallaxSection({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y: reduceMotion ? 0 : y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}

// Simple fade in (no y movement) — for headings etc
export function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}
