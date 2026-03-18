'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { usePostHog } from 'posthog-js/react'
import { PERSONAL } from '@/lib/content'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

const COPY = {
  control: { headline: PERSONAL.headline, cta: PERSONAL.cta },
  test: {
    headline: process.env.NEXT_PUBLIC_HERO_HEADLINE_TEST || PERSONAL.headline,
    cta: process.env.NEXT_PUBLIC_HERO_CTA_TEST || PERSONAL.cta,
  },
}

// Split text into characters for stagger animation
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.3 + wi * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

// Floating orb
function Orb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export function Hero({ headlineVariant }: { headlineVariant: 'control' | 'test' }) {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Mouse parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 30)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 30)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  const copy = COPY[headlineVariant]

  const handleCta = () => {
    posthog?.capture('hero_cta_clicked', { variant: headlineVariant, button_text: copy.cta, version: SITE_VERSION })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={ref} className="relative h-screen overflow-hidden flex items-center justify-center bg-zinc-950">
      {/* Animated gradient mesh background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,255,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(56,189,248,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_70%,rgba(168,85,247,0.15),transparent)]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      </motion.div>

      {/* Floating orbs — parallax with mouse */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: springX, y: springY }}>
        <Orb x="10%" y="20%" size={400} color="rgba(124,58,237,1)" delay={0} />
        <Orb x="65%" y="10%" size={300} color="rgba(56,189,248,1)" delay={2} />
        <Orb x="75%" y="65%" size={350} color="rgba(168,85,247,1)" delay={4} />
        <Orb x="5%" y="60%" size={250} color="rgba(99,102,241,1)" delay={1} />
      </motion.div>

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', backgroundSize: '200px' }} />

      {/* Dark vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #7c3aed, #38bdf8, #a855f7, #7c3aed)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-2 ring-zinc-950/50 bg-zinc-900">
              <Image src={PERSONAL.avatar} alt={PERSONAL.name} fill className="object-cover object-top" priority />
            </div>
          </div>
        </motion.div>

        {/* Name badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          {PERSONAL.name}
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.05]">
          <AnimatedText text={copy.headline} />
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-xl text-zinc-400 mb-10"
        >
          {PERSONAL.tagline}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            onClick={handleCta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative px-8 py-4 bg-white text-zinc-950 font-semibold rounded-full text-lg cursor-pointer overflow-hidden group"
          >
            <span className="relative z-10">{copy.cta}</span>
            <motion.div
              className="absolute inset-0 bg-violet-100"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="px-8 py-4 border border-zinc-700 text-zinc-300 font-semibold rounded-full text-lg cursor-pointer hover:border-zinc-500 hover:text-white transition-colors"
          >
            See Work
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity }}
      >
        <span className="text-zinc-500 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-zinc-500 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
