'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { PERSONAL } from '@/lib/content'
import { motion } from 'framer-motion'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

export function About() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5 && !fired.current) {
          fired.current = true
          posthog?.capture('about_section_viewed', { version: SITE_VERSION })
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [posthog])

  return (
    <section ref={ref} id="about" className="py-32 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-zinc-100">About</h2>
        <p className="text-xl text-zinc-400 leading-relaxed">{PERSONAL.bio}</p>
      </motion.div>
    </section>
  )
}
