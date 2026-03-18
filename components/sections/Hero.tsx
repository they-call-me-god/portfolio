'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { usePostHog } from 'posthog-js/react'
import { PERSONAL } from '@/lib/content'
import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'
const COPY = {
  control: { headline: PERSONAL.headline, cta: PERSONAL.cta },
  test: {
    headline: process.env.NEXT_PUBLIC_HERO_HEADLINE_TEST || PERSONAL.headline,
    cta: process.env.NEXT_PUBLIC_HERO_CTA_TEST || PERSONAL.cta,
  },
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

function useScramble(target: string, trigger: boolean) {
  const [display, setDisplay] = useState(target)
  useEffect(() => {
    if (!trigger) return
    let frame = 0
    const totalFrames = 20
    const interval = setInterval(() => {
      frame++
      setDisplay(
        target.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < Math.floor((frame / totalFrames) * target.length)) return char
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }).join('')
      )
      if (frame >= totalFrames) { clearInterval(interval); setDisplay(target) }
    }, 38)
    return () => clearInterval(interval)
  }, [target, trigger])
  return display
}

function MagneticButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}>
      {children}
    </motion.div>
  )
}

function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ opacity: 0.15, ...style }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function Hero({ headlineVariant }: { headlineVariant: 'control' | 'test' }) {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const orbX = useSpring(mouseX, { stiffness: 35, damping: 18 })
  const orbY = useSpring(mouseY, { stiffness: 35, damping: 18 })

  // Avatar tilt with mouse
  const avatarRotX = useSpring(useMotionValue(0), { stiffness: 100, damping: 25 })
  const avatarRotY = useSpring(useMotionValue(0), { stiffness: 100, damping: 25 })

  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 30)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 30)
      avatarRotX.set(-(e.clientY / window.innerHeight - 0.5) * 12)
      avatarRotY.set((e.clientX / window.innerWidth - 0.5) * 12)
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [mouseX, mouseY, avatarRotX, avatarRotY])

  const copy = COPY[headlineVariant]
  const scrambled = useScramble(copy.headline, ready)

  const handleCta = useCallback(() => {
    posthog?.capture('hero_cta_clicked', { variant: headlineVariant, button_text: copy.cta, version: SITE_VERSION })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }, [posthog, headlineVariant, copy.cta])

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden flex items-center bg-zinc-950 cursor-none">
      {/* Background mesh */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_30%_-10%,rgba(120,80,255,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_85%_80%,rgba(56,189,248,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_10%_80%,rgba(168,85,247,0.1),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      </motion.div>

      {/* Orbs */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: orbX, y: orbY }}>
        <Orb style={{ left: '5%', top: '10%', width: 400, height: 400, background: 'rgba(124,58,237,1)' }} />
        <Orb style={{ right: '5%', bottom: '10%', width: 350, height: 350, background: 'rgba(56,189,248,1)' }} />
        <Orb style={{ left: '40%', top: '60%', width: 280, height: 280, background: 'rgba(168,85,247,1)' }} />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      {/* SPLIT LAYOUT */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center min-h-screen py-24"
      >
        {/* LEFT — Text */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8 w-fit"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            Available for work · India
          </motion.div>

          {/* Scramble headline */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6 font-mono"
          >
            {scrambled}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-zinc-400 mb-4 max-w-md"
          >
            {PERSONAL.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="text-sm text-zinc-600 mb-10 max-w-md leading-relaxed"
          >
            15 y/o. Research intern at The HEART Venture. I ship AI voice agents and automation pipelines for real businesses — not demos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <MagneticButton onClick={handleCta}>
              <div className="relative px-7 py-3.5 bg-white text-zinc-950 font-semibold rounded-full text-base cursor-none overflow-hidden group">
                <span className="relative z-10">{copy.cta}</span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-sky-100" initial={{ x: '-100%' }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
              </div>
            </MagneticButton>
            <MagneticButton>
              <div
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-3.5 border border-zinc-700 text-zinc-300 font-semibold rounded-full text-base cursor-none hover:border-zinc-500 hover:text-white transition-colors"
              >
                See Work ↓
              </div>
            </MagneticButton>
          </motion.div>
        </div>

        {/* RIGHT — Avatar, BIG */}
        <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            style={{ rotateX: avatarRotX, rotateY: avatarRotY, transformStyle: 'preserve-3d', perspective: 1000 }}
            className="relative"
          >
            {/* Outer glow ring — animated */}
            <motion.div
              className="absolute -inset-4 rounded-full opacity-40"
              style={{ background: 'conic-gradient(from 0deg, #7c3aed, #38bdf8, #a855f7, #6366f1, #7c3aed)', filter: 'blur(20px)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            {/* Spinning border ring */}
            <motion.div
              className="absolute -inset-[3px] rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #7c3aed, transparent, #38bdf8, transparent, #a855f7, transparent, #7c3aed)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            {/* Avatar */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden bg-zinc-900 ring-4 ring-zinc-950">
              <Image
                src={PERSONAL.avatar}
                alt={PERSONAL.name}
                fill
                className="object-cover object-top scale-110"
                priority
              />
              {/* Subtle inner shadow so face pops */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_-60px_60px_rgba(0,0,0,0.4)]" />
            </div>

            {/* Name card floating below */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-700/60 backdrop-blur-sm rounded-2xl px-5 py-2.5 whitespace-nowrap text-center"
            >
              <div className="text-white font-semibold text-sm">{PERSONAL.name}</div>
              <div className="text-zinc-500 text-xs">AI Builder · Age 15</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-zinc-500 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: '0%' }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
