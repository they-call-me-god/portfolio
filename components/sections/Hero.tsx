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

function Scene3D({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
}) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [-18, 18]), { stiffness: 50, damping: 20 })
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [12, -12]), { stiffness: 50, damping: 20 })

  const avatarRing = isMobile ? '160px' : '220px'
  const avatarSize = isMobile ? '140px' : '200px'

  // CSS float animation string: 'keyframe-name duration timing delay fill-count'
  const card = (
    content: React.ReactNode,
    zDepth: string,
    pos: React.CSSProperties,
    floatAnim: string,
    enterDelay: number,
  ) => (
    <motion.div
      style={{ transform: zDepth, position: 'absolute', ...pos }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: enterDelay, ease: [0.33, 1, 0.68, 1] }}
    >
      <div style={{ animation: floatAnim }}>
        {content}
      </div>
    </motion.div>
  )

  const cardStyle: React.CSSProperties = {
    background: 'rgba(24,24,27,0.97)',
    borderRadius: '14px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="relative"
      style={{
        width: isMobile ? 'min(290px, 90vw)' : '420px',
        height: isMobile ? '320px' : '480px',
        perspective: '1100px',
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* Back rings */}
        <div style={{ transform: 'translateZ(-70px)', position: 'absolute', inset: isMobile ? '40px' : '60px', borderRadius: '9999px', border: '1px solid rgba(153,27,27,0.12)' }} />
        <div style={{ transform: 'translateZ(-35px)', position: 'absolute', inset: isMobile ? '20px' : '30px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.04)' }} />

        {/* ── AVATAR ── */}
        <div style={{ transform: 'translateZ(0px)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Conic ring — CSS spin, no Framer Motion */}
          <div style={{
            position: 'absolute',
            width: avatarRing,
            height: avatarRing,
            borderRadius: '9999px',
            background: 'conic-gradient(from 0deg, #991b1b, transparent, #dc2626, transparent, #7f1d1d, transparent, #991b1b)',
            filter: 'blur(1px)',
            animation: 'spin-slow 6s linear infinite',
          }} />
          <div style={{ position: 'relative', width: avatarSize, height: avatarSize, borderRadius: '9999px', overflow: 'hidden', background: '#18181b', zIndex: 1 }}>
            <Image src={PERSONAL.avatar} alt={PERSONAL.name} fill className="object-cover object-[center_75%] scale-110" priority />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '9999px', boxShadow: 'inset 0 -40px 40px rgba(0,0,0,0.5)' }} />
          </div>
        </div>

        {/* ── 15 y/o card — top-left ── */}
        {card(
          <div style={{ ...cardStyle, border: '1px solid rgba(153,27,27,0.5)', padding: isMobile ? '10px 14px' : '12px 18px' }}>
            <div style={{ color: '#dc2626', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Builder</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: isMobile ? '22px' : '26px', lineHeight: 1 }}>15 y/o</div>
            <div style={{ color: '#52525b', fontSize: '10px', marginTop: '3px' }}>India 🇮🇳</div>
          </div>,
          isMobile ? 'translateZ(50px)' : 'translateZ(85px)',
          isMobile ? { left: '0px', top: '20px' } : { left: '-8px', top: '28px' },
          'float-up 4s ease-in-out infinite',
          0.6,
        )}

        {/* ── AI Voice Agents — top-right ── */}
        {card(
          <div style={{ ...cardStyle, border: '1px solid rgba(63,63,70,0.6)', padding: isMobile ? '10px 14px' : '12px 18px' }}>
            <div style={{ color: '#71717a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Specialty</div>
            <div style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '13px' }}>AI Voice Agents</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
              {/* Status dot — CSS blink, no Framer Motion */}
              <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#4ade80', display: 'block', flexShrink: 0, animation: 'blink 1.4s ease-in-out infinite' }} />
              <span style={{ color: '#52525b', fontSize: '10px' }}>Live</span>
            </div>
          </div>,
          isMobile ? 'translateZ(40px)' : 'translateZ(60px)',
          isMobile ? { right: '0px', top: '50px' } : { right: '-16px', top: '55px' },
          'float-down 5s ease-in-out 0.8s infinite',
          0.8,
        )}

        {/* ── 90% metric — bottom-right ── */}
        {card(
          <div style={{ ...cardStyle, border: '1px solid rgba(127,29,29,0.45)', padding: isMobile ? '10px 14px' : '12px 18px' }}>
            <div style={{ color: '#dc2626', fontWeight: 900, fontSize: isMobile ? '26px' : '32px', lineHeight: 1 }}>90%</div>
            <div style={{ color: '#52525b', fontSize: '10px', marginTop: '3px' }}>call time cut</div>
          </div>,
          isMobile ? 'translateZ(55px)' : 'translateZ(100px)',
          isMobile ? { right: '0px', bottom: '60px' } : { right: '-24px', bottom: '72px' },
          'float-up 6s ease-in-out 1.5s infinite',
          1.0,
        )}

        {/* ── HEART Venture — bottom-left ── */}
        {card(
          <div style={{ ...cardStyle, border: '1px solid rgba(63,63,70,0.6)', padding: isMobile ? '10px 14px' : '12px 18px' }}>
            <div style={{ color: '#71717a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Intern</div>
            <div style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '12px', lineHeight: 1.3 }}>HEART<br />Venture</div>
          </div>,
          isMobile ? 'translateZ(35px)' : 'translateZ(50px)',
          isMobile ? { left: '0px', bottom: '70px' } : { left: '-14px', bottom: '88px' },
          'float-down 4.5s ease-in-out 2s infinite',
          1.2,
        )}

        {/* ── n8n tag ── */}
        {!isMobile && card(
          <div style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(153,27,27,0.45)', borderRadius: '9999px', padding: '5px 12px' }}>
            <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>n8n</span>
          </div>,
          'translateZ(118px)',
          { right: '28px', top: '14px' },
          'float-up-sm 3.5s ease-in-out 0.3s infinite',
          1.4,
        )}

        {/* ── VAPI tag ── */}
        {!isMobile && card(
          <div style={{ background: 'rgba(39,39,42,0.7)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '9999px', padding: '5px 12px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 600 }}>VAPI</span>
          </div>,
          'translateZ(72px)',
          { left: '38px', bottom: '34px' },
          'float-up-sm 5s ease-in-out 1s infinite',
          1.6,
        )}

        {/* ── Red dot — CSS dot-pulse ── */}
        {!isMobile && (
          <div
            style={{
              transform: 'translateZ(110px)',
              position: 'absolute',
              left: '50%',
              top: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              background: '#dc2626',
              boxShadow: '0 0 12px rgba(220,38,38,0.8)',
              animation: 'dot-pulse 4s ease-in-out 2.5s infinite',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          />
        )}
      </motion.div>
    </motion.div>
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

  const sceneMouseX = useMotionValue(0)
  const sceneMouseY = useMotionValue(0)

  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t) }, [])

  // RAF-throttled mousemove — only one update per animation frame
  useEffect(() => {
    let rafId = 0
    let lastX = 0
    let lastY = 0
    const handle = (e: MouseEvent) => {
      lastX = e.clientX
      lastY = e.clientY
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        mouseX.set((lastX / window.innerWidth - 0.5) * 30)
        mouseY.set((lastY / window.innerHeight - 0.5) * 30)
        sceneMouseX.set(lastX / window.innerWidth - 0.5)
        sceneMouseY.set(lastY / window.innerHeight - 0.5)
        rafId = 0
      })
    }
    window.addEventListener('mousemove', handle)
    return () => {
      window.removeEventListener('mousemove', handle)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, sceneMouseX, sceneMouseY])

  const copy = COPY[headlineVariant]
  const scrambled = useScramble(copy.headline, ready)

  const handleCta = useCallback(() => {
    posthog?.capture('hero_cta_clicked', { variant: headlineVariant, button_text: copy.cta, version: SITE_VERSION })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }, [posthog, headlineVariant, copy.cta])

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden flex items-center cursor-none">
      {/* Background mesh */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_30%_-10%,rgba(153,27,27,0.28),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_85%_80%,rgba(127,29,29,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_10%_80%,rgba(185,28,28,0.12),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      </motion.div>

      {/* Orbs — CSS animations, GPU compositor thread */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ x: orbX, y: orbY }}>
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            left: '5%', top: '10%', width: 400, height: 400,
            background: 'rgba(153,27,27,1)',
            animation: 'orb-breathe 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            right: '5%', bottom: '10%', width: 350, height: 350,
            background: 'rgba(127,29,29,1)',
            animation: 'orb-breathe 8s ease-in-out 2s infinite',
          }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      {/* SPLIT LAYOUT */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-screen py-16 md:py-24"
      >
        {/* LEFT — Text */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-800/40 bg-red-900/20 text-red-400 text-sm font-medium mb-8 w-fit"
          >
            {/* Status dot — CSS blink */}
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ display: 'block', animation: 'blink 1.4s ease-in-out infinite' }}
            />
            Available for work · India
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6 font-mono"
          >
            {scrambled}
          </motion.h1>

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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <MagneticButton onClick={handleCta}>
              <div className="relative px-7 py-3.5 bg-white text-zinc-950 font-semibold rounded-full text-base cursor-none overflow-hidden group">
                <span className="relative z-10">{copy.cta}</span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-red-100 to-rose-100" initial={{ x: '-100%' }} whileHover={{ x: 0 }} transition={{ duration: 0.3 }} />
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

        {/* RIGHT — 3D Interactive Scene */}
        <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
          <Scene3D mouseX={sceneMouseX} mouseY={sceneMouseY} />
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
