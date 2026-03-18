'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { PERSONAL } from '@/lib/content'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

const SKILLS = ['VAPI', 'n8n', 'ElevenLabs', 'Twilio', 'Python', 'AI Automation', 'Next.js', 'Voice Agents']

const STATS = [
  { value: '15', label: 'Years Old' },
  { value: '4+', label: 'Live Products' },
  { value: '∞', label: 'Automation Loops' },
  { value: '1', label: 'Research Internship' },
]

function FlipStatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div ref={ref} style={{ perspective: '900px' }}>
      <motion.div
        initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
        animate={inView ? { rotateY: 0, opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.75, delay: index * 0.15, ease: [0.33, 1, 0.68, 1] }}
        whileHover={{ rotateY: -8, rotateX: 6, scale: 1.06 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
        className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 text-center backdrop-blur-sm cursor-default overflow-hidden group"
      >
        {/* Depth shine */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(220,38,38,0.12), transparent 65%)' }}
        />
        <div className="text-4xl font-bold text-white mb-1 relative z-10">{value}</div>
        <div className="text-sm text-zinc-500 relative z-10">{label}</div>
        {/* Bottom edge glow on hover */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent)' }}
        />
      </motion.div>
    </div>
  )
}

export function About() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const fired = useRef(false)

  // Section 3D rise on scroll
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [18, 0, 0, -5])
  const sectionY = useTransform(scrollYProgress, [0, 0.2], [80, 0])
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1])

  // Mouse parallax tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 60, damping: 20 })
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 60, damping: 20 })

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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  return (
    <section
      ref={ref}
      id="about"
      className="py-20 md:py-32 px-6 max-w-5xl mx-auto relative"
      style={{ perspective: '1400px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, y: sectionY, opacity: sectionOpacity, transformStyle: 'preserve-3d' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Left — text with subtle mouse tilt */}
        <motion.div style={{ rotateY: tiltY, rotateX: tiltX }}>
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

            {/* Skills — staggered fly-in from slight depth */}
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.06, ease: [0.33, 1, 0.68, 1] }}
                  whileHover={{ scale: 1.12, borderColor: 'rgba(185,28,28,0.8)', color: '#fca5a5' }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right — 3D flip stat cards */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <FlipStatCard key={stat.label} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
