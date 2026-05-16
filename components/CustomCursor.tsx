'use client'

import { useEffect, useRef, useState } from 'react'

// Linear interpolation factor per frame. Higher = snappier, lower = floatier.
const RING_LERP = 0.22

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  // Mouse target + ring eased position, all in refs to avoid re-renders.
  const target = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })

  const [isTouch, setIsTouch] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true)
      return
    }
    setIsTouch(false)

    let hovered = false
    let clicked = false
    let hidden = false

    const move = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      // Dot follows pointer 1:1 every frame, no spring, no lag.
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }

    const setHovered = (next: boolean) => {
      if (next === hovered) return
      hovered = next
      if (ringRef.current) {
        ringRef.current.style.setProperty('--ring-size', next ? '48px' : '36px')
        ringRef.current.style.setProperty('--ring-bg', next ? '#fff' : 'transparent')
        ringRef.current.style.setProperty('--ring-border', next ? '0px' : '1.5px')
      }
    }

    const setLabel = (text: string) => {
      if (!labelRef.current) return
      if (labelRef.current.textContent !== text) labelRef.current.textContent = text
    }

    const enter = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      // Cheap force-none on whatever the pointer is over.
      t.style.setProperty('cursor', 'none', 'important')
      const interactive =
        t.matches?.('a, button, [role="button"], input, textarea, select, label') ||
        !!t.closest?.('a, button, [role="button"]')
      setHovered(!!interactive)
      const labelText = t.getAttribute?.('data-cursor') ||
        t.closest?.('[data-cursor]')?.getAttribute('data-cursor') || ''
      setLabel(labelText)
    }

    const down = () => {
      clicked = true
      if (ringRef.current) ringRef.current.style.setProperty('--ring-scale', '0.55')
    }
    const up = () => {
      clicked = false
      if (ringRef.current) ringRef.current.style.setProperty('--ring-scale', '1')
    }
    const leave = () => {
      hidden = true
      if (ringRef.current) ringRef.current.style.opacity = '0'
      if (dotRef.current) dotRef.current.style.opacity = '0'
    }
    const re = () => {
      hidden = false
      if (ringRef.current) ringRef.current.style.opacity = '1'
      if (dotRef.current) dotRef.current.style.opacity = '1'
    }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', enter, { passive: true })
    document.addEventListener('mousedown', down, { passive: true })
    document.addEventListener('mouseup', up, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    document.documentElement.addEventListener('mouseenter', re)

    // Belt-and-suspenders: inject a runtime <style> tag that no other CSS layer can shadow.
    const styleEl = document.createElement('style')
    styleEl.id = 'nuclear-cursor-kill'
    styleEl.textContent = `
      html, body, *, *::before, *::after { cursor: none !important; }
      a, a *, button, button *, [role="button"], [role="button"] *,
      input, textarea, select, label, summary, details, [tabindex],
      svg, svg *, canvas, [data-slot], [data-state] { cursor: none !important; }
    `
    document.head.appendChild(styleEl)

    let raf = 0
    const tick = () => {
      ring.current.x += (target.current.x - ring.current.x) * RING_LERP
      ring.current.y += (target.current.y - ring.current.y) * RING_LERP
      if (ringRef.current && !hidden) {
        ringRef.current.style.transform =
          `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(var(--ring-scale, 1))`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', enter)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.documentElement.removeEventListener('mouseenter', re)
      styleEl.remove()
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: 'var(--ring-size, 36px)',
          height: 'var(--ring-size, 36px)',
          borderRadius: '50%',
          border: 'var(--ring-border, 1.5px) solid #fff',
          backgroundColor: 'var(--ring-bg, transparent)',
          transition: 'width 160ms ease-out, height 160ms ease-out, background-color 160ms ease-out, border-width 160ms ease-out',
          willChange: 'transform',
        }}
      >
        <span
          ref={labelRef}
          className="absolute inset-0 flex items-center justify-center text-black text-[9px] font-bold uppercase tracking-widest"
        />
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: '#fff',
          willChange: 'transform',
        }}
      />
    </>
  )
}
