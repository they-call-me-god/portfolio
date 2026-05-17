'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 70
const TRAIL_SPAN = 0.4
const DURATION_MS = 5600
const BURGUNDY = '#8b1e3f'

const CONFIG = {
  a: 20,
  boost: 7,
}

function point(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2
  const scale = CONFIG.a + detailScale * CONFIG.boost
  const denom = 1 + Math.sin(t) ** 2
  return {
    x: 50 + (scale * Math.cos(t)) / denom,
    y: 50 + (scale * Math.sin(t) * Math.cos(t)) / denom,
  }
}

function normalize(p: number) {
  return ((p % 1) + 1) % 1
}

export function LissajousLoader({
  size = 180,
  color = BURGUNDY,
}: {
  size?: number
  color?: string
}) {
  const particleRefs = useRef<(SVGCircleElement | null)[]>([])
  const startRef = useRef<number>(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const progress = (elapsed % DURATION_MS) / DURATION_MS
      const detailScale = (Math.sin(elapsed / 1800) + 1) / 2

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const node = particleRefs.current[i]
        if (!node) continue
        const tailOffset = i / (PARTICLE_COUNT - 1)
        const p = point(normalize(progress - tailOffset * TRAIL_SPAN), detailScale)
        const fade = Math.pow(1 - tailOffset, 0.56)
        node.setAttribute('cx', p.x.toFixed(2))
        node.setAttribute('cy', p.y.toFixed(2))
        node.setAttribute('r', (0.9 + fade * 2.6).toFixed(2))
        node.setAttribute('opacity', (0.04 + fade * 0.96).toFixed(3))
      }

      if (!reduceMotion) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Loading"
      style={{ color, overflow: 'visible' }}
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <circle
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el
          }}
          cx="50"
          cy="50"
          r="0"
          fill={color}
        />
      ))}
    </svg>
  )
}
