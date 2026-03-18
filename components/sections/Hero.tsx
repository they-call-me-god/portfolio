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
    const totalFrames = 18
    const interval = setInterval(() => {
      frame++
      setDisplay(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < Math.floor((frame / totalFrames) * target.length)) return char
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join('')
      )
      if (frame >= totalFrames) {
        clearInterval(interval)
        setDisplay(target)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [target, trigger])

  return display
}

// Magnetic button wrapper
function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

function Orb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, opacity: 0.18 }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12], x: [0, 25, -15, 0], y: [0, -15, 25, 0] }}
      transition={{ duration: 9 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export function Hero({ headlineVariant }: { headlineVariant: 'control' | 'test' }) {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  // Mouse parallax for orbs
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const orbSpringX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const orbSpringY = useSpring(mouseY, { stiffness: 40, damping: 18 })

  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 35)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 35)
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [mouseX, mouseY])

  const copy = COPY[headlineVariant]
  const scrambledHeadline = useScramble(copy.headline, ready)

  const handleCta = useCallback(() => {
    posthog?.capture('hero_cta_clicked', { variant: headlineVariant, button_text: copy.cta, version: SITE_VERSION })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }, [posthog, headlineVariant, copy.cta])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden flex items-center justify-center bg-zinc-950 cursor-none">
      {/* Animated gradient mesh */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,255,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(56,189,248,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_15%_70%,rgba(168,85,247,0.12),transparent)]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      </motion.div>

      {/* Floating orbs with mouse parallax */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: orbSpringX, y: orbSpringY }}>
        <Orb x="8%" y="15%" size={420} color="rgba(124,58,237,1)" delay={0} />
        <Orb x="62%" y="8%" size={320} color="rgba(56,189,248,1)" delay={2.5} />
        <Orb x="72%" y="62%" size={360} color="rgba(168,85,247,1)" delay={4.5} />
        <Orb x="3%" y="58%" size={260} color="rgba(99,102,241,1)" delay={1.5} />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

      {/* Content */}
      <motion.div style={{ y: textY, opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Avatar with rotating ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-[3px] rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #7c3aed, #38bdf8, #a855f7, #6366f1, #7c3aed)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-zinc-900 ring-2 ring-zinc-950">
              <Image src={PERSONAL.avatar} alt={PERSONAL.name} fill className="object-cover object-top" priority />
            </div>
          </div>
        </motion.div>

        {/* Name pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {PERSONAL.name} · Available for work
        </motion.div>

        {/* Scramble headline */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.05] font-mono"
        >
          {scrambledHeadline}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-xl text-zinc-400 mb-10"
        >
          {PERSONAL.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <MagneticButton onClick={handleCta}>
            <div className="relative px-8 py-4 bg-white text-zinc-950 font-semibold rounded-full text-lg cursor-none overflow-hidden group">
              <span className="relative z-10">{copy.cta}</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-100 to-sky-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </MagneticButton>

          <MagneticButton>
            <div
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-zinc-700 text-zinc-300 font-semibold rounded-full text-lg cursor-none hover:border-zinc-500 hover:text-white transition-colors"
            >
              See Work ↓
            </div>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll line */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{ opacity }}
      >
        <span className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-zinc-500 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: '0%' }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
