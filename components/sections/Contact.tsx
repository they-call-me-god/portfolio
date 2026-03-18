'use client'

import { usePostHog } from 'posthog-js/react'
import { CONTACT } from '@/lib/content'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

type ContactMethod = 'linkedin' | 'github' | 'instagram' | 'email'

const PLATFORMS: {
  method: ContactMethod
  label: string
  handle: string
  href: string
  color: string
  bg: string
  icon: React.ReactNode
}[] = [
  {
    method: 'linkedin',
    label: 'LinkedIn',
    handle: 'shauryalowkeygotaura',
    href: CONTACT.linkedin,
    color: 'text-red-400',
    bg: 'group-hover:bg-red-900/20 group-hover:border-red-700/40',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    method: 'github',
    label: 'GitHub',
    handle: 'they-call-me-god',
    href: CONTACT.github,
    color: 'text-zinc-300',
    bg: 'group-hover:bg-zinc-800/40 group-hover:border-zinc-600/40',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    method: 'instagram',
    label: 'Instagram',
    handle: 'shauryascales',
    href: CONTACT.instagram,
    color: 'text-rose-400',
    bg: 'group-hover:bg-rose-900/20 group-hover:border-rose-700/40',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    method: 'email',
    label: 'Email',
    handle: 'shauryavardhan.shandilya',
    href: `mailto:${CONTACT.email}`,
    color: 'text-red-500',
    bg: 'group-hover:bg-red-900/20 group-hover:border-red-700/40',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

function DepthPlatformCard({
  platform,
  index,
  posthog,
}: {
  platform: (typeof PLATFORMS)[0]
  index: number
  posthog: ReturnType<typeof usePostHog>
}) {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    rotateX.set(-(((e.clientY - rect.top) / rect.height) - 0.5) * 12)
    rotateY.set((((e.clientX - rect.left) / rect.width) - 0.5) * 12)
  }
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0) }

  // Each card flies in from a different Z depth — creates cascade from deep space
  const zStart = -(index + 1) * 180
  const delay = index * 0.14

  return (
    <div style={{ perspective: '1400px' }}>
      <motion.a
        ref={ref}
        href={platform.href}
        target={platform.method === 'email' ? undefined : '_blank'}
        rel="noopener noreferrer"
        initial={{ y: 50, opacity: 0, scale: 0.85, rotateX: 12 }}
        whileInView={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay, ease: [0.33, 1, 0.68, 1] }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => posthog?.capture('contact_link_clicked', { method: platform.method, version: SITE_VERSION })}
        className={`group relative flex items-center gap-5 px-7 py-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-sm transition-colors duration-300 cursor-none ${platform.bg}`}
        data-cursor="HIT ME"
      >
        {/* 3D depth layer — appears to float in front */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(153,27,27,0.1), transparent 60%)' }}
        />

        <div className={`flex-shrink-0 ${platform.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
          {platform.icon}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-0.5">{platform.label}</span>
          <span className="text-zinc-100 font-semibold text-base md:text-lg truncate group-hover:text-white transition-colors">
            {platform.method === 'email' ? (
              <>{platform.handle}<span className="text-zinc-500">@gmail.com</span></>
            ) : (
              <>@{platform.handle}</>
            )}
          </span>
        </div>

        <div className="ml-auto flex-shrink-0">
          <motion.div
            className={`w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-current transition-colors ${platform.color}`}
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </motion.div>
        </div>
      </motion.a>
    </div>
  )
}

export function Contact() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const sectionRotateX = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [16, 0, 0, -4])
  const sectionY = useTransform(scrollYProgress, [0, 0.2], [80, 0])
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  return (
    <section ref={ref} id="contact" className="py-20 md:py-32 px-6 relative overflow-hidden" style={{ perspective: '1400px' }}>
      {/* Ambient depth glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-red-800/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-0 w-[300px] h-[300px] bg-red-950/15 rounded-full blur-[80px]" />
      </div>

      <motion.div
        style={{ rotateX: sectionRotateX, y: sectionY, opacity: sectionOpacity, transformStyle: 'preserve-3d' }}
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Headline with 3D text depth */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          style={{ perspective: '800px' }}
          className="mb-16"
        >
          <span style={{ color: '#dc2626' }} className="text-sm font-medium tracking-widest uppercase mb-4 block">Find Me</span>
          <h2
            className="text-5xl md:text-7xl font-bold text-white leading-[1.0] mb-6"
            style={{
              // 3D text depth via layered text-shadow
              textShadow: '0 2px 0 rgba(220,38,38,0.15), 0 4px 0 rgba(153,27,27,0.10), 0 6px 20px rgba(0,0,0,0.4)',
            }}
          >
            Let&apos;s make<br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-600 to-red-900"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(220,38,38,0.3))' }}
            >
              something insane.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-lg">
            15 y/o builder. If you have a real problem that AI can solve, I want to hear it.
          </p>
        </motion.div>

        {/* Platform cards — cascade from depth */}
        <div className="flex flex-col gap-4">
          {PLATFORMS.map((platform, i) => (
            <DepthPlatformCard key={platform.method} platform={platform} index={i} posthog={posthog} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="mt-16 pt-8 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-4"
        >
          <span className="text-zinc-600 text-sm">Based in India · Open to remote</span>
          <span className="text-zinc-600 text-sm font-mono">{CONTACT.email}</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
