'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  // Tighter spring — much less lag
  const springX = useSpring(cursorX, { stiffness: 600, damping: 35, mass: 0.4 })
  const springY = useSpring(cursorY, { stiffness: 600, damping: 35, mass: 0.4 })

  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [label, setLabel] = useState('')
  const [hidden, setHidden] = useState(false)
  const [isTouch, setIsTouch] = useState(true) // start hidden until confirmed pointer device

  useEffect(() => {
    // Hide on touch/mobile devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true)
      return
    }
    setIsTouch(false)

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      dotX.set(e.clientX)
      dotY.set(e.clientY)
    }

    const enter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target.matches('a, button, [role="button"], input, textarea, select, label') ||
        !!target.closest('a, button, [role="button"]')
      setHovered(isInteractive)
      const cursorLabel = target.getAttribute('data-cursor') ||
        target.closest('[data-cursor]')?.getAttribute('data-cursor') || ''
      setLabel(cursorLabel)
    }

    const mouseDown = () => setClicked(true)
    const mouseUp = () => setClicked(false)
    const mouseLeave = () => setHidden(true)
    const mouseEnter = () => setHidden(false)

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', enter)
    document.addEventListener('mousedown', mouseDown)
    document.addEventListener('mouseup', mouseUp)
    document.documentElement.addEventListener('mouseleave', mouseLeave)
    document.documentElement.addEventListener('mouseenter', mouseEnter)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', enter)
      document.removeEventListener('mousedown', mouseDown)
      document.removeEventListener('mouseup', mouseUp)
      document.documentElement.removeEventListener('mouseleave', mouseLeave)
      document.documentElement.removeEventListener('mouseenter', mouseEnter)
    }
  }, [cursorX, cursorY, dotX, dotY])

  if (isTouch) return null

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          width: clicked ? 20 : hovered ? 48 : 36,
          height: clicked ? 20 : hovered ? 48 : 36,
          opacity: hidden ? 0 : 1,
          backgroundColor: hovered ? 'white' : 'transparent',
          borderWidth: hovered ? 0 : 1.5,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          borderRadius: '50%',
          border: '1.5px solid white',
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        {label && (
          <span className="absolute inset-0 flex items-center justify-center text-black text-[9px] font-bold uppercase tracking-widest">
            {label}
          </span>
        )}
      </motion.div>

      {/* Inner dot — no spring, instant */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: 'white',
          opacity: hidden ? 0 : 1,
        }}
      />
    </>
  )
}
