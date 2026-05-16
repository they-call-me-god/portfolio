'use client'

import { useEffect, useState } from 'react'
import { LissajousLoader } from './LissajousLoader'

const MIN_DURATION_MS = 900
const FADE_MS = 450

export function PageSplash() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const start = performance.now()

    const hide = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed)
      window.setTimeout(() => {
        setFading(true)
        window.setTimeout(() => setVisible(false), FADE_MS)
      }, remaining)
    }

    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
      return () => window.removeEventListener('load', hide)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden={fading}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-100"
      style={{
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <LissajousLoader size={200} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
        Loading
      </p>
    </div>
  )
}
