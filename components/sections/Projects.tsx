'use client'

import { usePostHog } from 'posthog-js/react'
import { PROJECTS } from '@/lib/content'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

function TiltCard({ project, index, posthog }: { project: typeof PROJECTS[0]; index: number; posthog: ReturnType<typeof usePostHog> }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    rotateX.set(-(((e.clientY - rect.top) / rect.height) - 0.5) * 10)
    rotateY.set((((e.clientX - rect.left) / rect.width) - 0.5) * 10)
  }
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0) }

  return (
    <div ref={ref} style={{ perspective: 1000 }}>
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        onClick={() => posthog?.capture('project_card_clicked', { project_name: project.name, version: SITE_VERSION })}
        data-cursor="VIEW"
        className="group block cursor-none"
      >
        <div className="relative h-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 overflow-hidden transition-colors duration-300 group-hover:border-red-800/40 backdrop-blur-sm flex flex-col gap-4 min-h-[260px]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(153,27,27,0.15) 0%, transparent 65%)' }} />

          <div className="flex items-start justify-between">
            <span className="text-5xl font-black text-zinc-800 group-hover:text-red-950/60 transition-colors select-none leading-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <motion.div
              className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-colors flex-shrink-0"
              whileHover={{ rotate: 45 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-red-500 transition-colors">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3 relative z-10 flex-1">
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white leading-snug transition-colors">
              {project.name}
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed flex-1">{project.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.a>
    </div>
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
        className="mb-14"
      >
        <span className="text-red-500 text-sm font-medium tracking-widest uppercase mb-3 block">Work</span>
        <h2 className="text-4xl font-bold text-zinc-100">
          Things I've <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Built</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PROJECTS.map((project, i) => (
          <TiltCard key={project.name} project={project} index={i} posthog={posthog} />
        ))}
      </div>
    </section>
  )
}
