'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { usePostHog } from 'posthog-js/react'
import { PERSONAL } from '@/lib/content'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

const COPY = {
  control: {
    headline: PERSONAL.headline,
    cta: PERSONAL.cta,
  },
  test: {
    headline: process.env.NEXT_PUBLIC_HERO_HEADLINE_TEST || PERSONAL.headline,
    cta: process.env.NEXT_PUBLIC_HERO_CTA_TEST || PERSONAL.cta,
  },
}

export function Hero({ headlineVariant }: { headlineVariant: 'control' | 'test' }) {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])

  const copy = COPY[headlineVariant]

  const handleCta = () => {
    posthog?.capture('hero_cta_clicked', {
      variant: headlineVariant,
      button_text: copy.cta,
      version: SITE_VERSION,
    })
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={ref} className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Parallax background — replace /hero.svg with /hero.jpg after Nanobanana generation */}
      <motion.div
        style={{ y: bgY, backgroundImage: 'url(/hero.svg)' }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-zinc-950/70" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
          {copy.headline}
        </h1>
        <p className="text-xl text-zinc-400 mb-10">{PERSONAL.tagline}</p>
        <button
          onClick={handleCta}
          className="px-8 py-4 bg-white text-zinc-950 font-semibold rounded-full hover:bg-zinc-200 transition-colors text-lg cursor-pointer"
        >
          {copy.cta}
        </button>
      </motion.div>
    </section>
  )
}
