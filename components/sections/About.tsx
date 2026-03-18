'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { PERSONAL } from '@/lib/content'
import { motion, useInView } from 'framer-motion'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

const SKILLS = ['VAPI', 'n8n', 'ElevenLabs', 'Twilio', 'Python', 'AI Automation', 'Next.js', 'Voice Agents']

const STATS = [
  { value: '15', label: 'Years Old' },
  { value: '4+', label: 'Live Products' },
  { value: '∞', label: 'Automation Loops' },
  { value: '1', label: 'Research Internship' },
]

function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] }}
      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center backdrop-blur-sm"
    >
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </motion.div>
  )
}

export function About() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const fired = useRef(false)
  const inView = useInView(ref, { once: true, amount: 0.2 })

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
    <section ref={ref} id="about" className="py-32 px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className="text-red-500 text-sm font-medium tracking-widest uppercase mb-4 block">About Me</span>
            <h2 className="text-4xl font-bold mb-6 text-zinc-100 leading-tight">
              I don't build side projects.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">I ship products.</span>
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8">{PERSONAL.bio}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.08, borderColor: 'rgba(185,28,28,0.7)' }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
