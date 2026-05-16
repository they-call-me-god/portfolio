'use client'

import { useEffect, useState } from 'react'
import { LissajousLoader } from './LissajousLoader'

// Long enough to actually see, short enough not to be annoying.
const MIN_DURATION_MS = 1600
const FADE_MS = 500

export function PageSplash() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let fadeT: number | undefined
    let unmountT: number | undefined

    const hide = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed)
      fadeT = window.setTimeout(() => {
        setFading(true)
        unmountT = window.setTimeout(() => setVisible(false), FADE_MS)
      }, remaining)
    }

    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
    }

    return () => {
      if (fadeT) window.clearTimeout(fadeT)
      if (unmountT) window.clearTimeout(unmountT)
      window.removeEventListener('load', hide)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden={fading}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        backgroundColor: '#09090b',
        color: '#fafafa',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <LissajousLoader size={200} />
      <p
        style={{
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#71717a',
          margin: 0,
        }}
      >
        Loading
      </p>
    </div>
  )
}
