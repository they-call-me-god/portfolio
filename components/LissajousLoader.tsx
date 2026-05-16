'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 68
const TRAIL_SPAN = 0.34
const DURATION_MS = 6000

const CONFIG = {
  amp: 24,
  ampBoost: 6,
  ax: 3,
  by: 4,
  phase: 1.57,
  yScale: 0.92,
}

function point(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2
  const amp = CONFIG.amp + detailScale * CONFIG.ampBoost
  return {
    x: 50 + Math.sin(CONFIG.ax * t + CONFIG.phase) * amp,
    y: 50 + Math.sin(CONFIG.by * t) * (amp * CONFIG.yScale),
  }
}

function normalize(p: number) {
  return ((p % 1) + 1) % 1
}

export function LissajousLoader({ size = 180 }: { size?: number }) {
  const particleRefs = useRef<(SVGCircleElement | null)[]>([])
  const pathRef = useRef<SVGPathElement | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    startRef.current = performance.now()

    const buildPath = (detailScale: number) => {
      let d = ''
      const steps = 240
      for (let i = 0; i <= steps; i++) {
        const p = point(i / steps, detailScale)
        d += (i === 0 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2)
      }
      return d
    }

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const progress = (elapsed % DURATION_MS) / DURATION_MS
      const detailScale = (Math.sin(elapsed / 1800) + 1) / 2

      if (pathRef.current) pathRef.current.setAttribute('d', buildPath(detailScale))

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const node = particleRefs.current[i]
        if (!node) continue
        const tailOffset = i / (PARTICLE_COUNT - 1)
        const p = point(normalize(progress - tailOffset * TRAIL_SPAN), detailScale)
        const fade = Math.pow(1 - tailOffset, 0.56)
        node.setAttribute('cx', p.x.toFixed(2))
        node.setAttribute('cy', p.y.toFixed(2))
        node.setAttribute('r', (0.9 + fade * 2.7).toFixed(2))
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
      style={{ color: 'currentColor', overflow: 'visible' }}
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="currentColor"
        strokeWidth={4.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.1}
      />
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <circle
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el
          }}
          cx="50"
          cy="50"
          r="0"
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
