'use client'

import { usePostHog } from 'posthog-js/react'
import { PROJECTS } from '@/lib/content'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

function TiltCard({ project, index, posthog }: { project: typeof PROJECTS[0]; index: number; posthog: ReturnType<typeof usePostHog> }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 20 })
  const springY = useSpring(y, { stiffness: 150, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.33, 1, 0.68, 1] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => posthog?.capture('project_card_clicked', { project_name: project.name, version: SITE_VERSION })}
      className="group block"
    >
      <div className="relative h-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 overflow-hidden transition-colors duration-300 group-hover:border-violet-500/40 backdrop-blur-sm">
        {/* Gradient hover shine */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%)' }}
        />
        {/* Index number */}
        <div className="text-6xl font-bold text-zinc-800 absolute top-4 right-6 select-none group-hover:text-violet-900/50 transition-colors duration-300">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="relative z-10 flex flex-col h-full gap-4">
          <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white pr-10 leading-snug transition-colors">
            {project.name}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed flex-1">{project.description}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-violet-400 text-sm font-medium mt-1 group-hover:gap-2 transition-all">
            View on GitHub
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export function Projects() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} id="projects" className="py-32 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4 block">Work</span>
        <h2 className="text-4xl font-bold text-zinc-100">
          Things I've <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">Built</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS.map((project, i) => (
          <TiltCard key={project.name} project={project} index={i} posthog={posthog} />
        ))}
      </div>
    </section>
  )
}
