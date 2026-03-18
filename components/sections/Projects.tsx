'use client'

import { usePostHog } from 'posthog-js/react'
import { PROJECTS } from '@/lib/content'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

function TiltCard({ project, index, posthog }: { project: typeof PROJECTS[0]; index: number; posthog: ReturnType<typeof usePostHog> }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(-ny * 10)
    rotateY.set(nx * 10)
  }
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0) }

  return (
    <div
      ref={ref}
      style={{ perspective: 1000 }}
      className="flex-shrink-0 w-[340px] md:w-[400px]"
    >
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        onClick={() => posthog?.capture('project_card_clicked', { project_name: project.name, version: SITE_VERSION })}
        data-cursor="VIEW"
        className="group block h-[320px] relative cursor-none"
      >
        <div className="absolute inset-0 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 overflow-hidden transition-colors duration-300 group-hover:border-violet-500/40 backdrop-blur-sm flex flex-col justify-between">
          {/* Hover shine */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 65%)' }} />

          {/* Top */}
          <div className="flex items-start justify-between">
            <span className="text-5xl font-black text-zinc-800 group-hover:text-violet-900/60 transition-colors select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <motion.div
              className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-violet-400 group-hover:bg-violet-400/10 transition-colors"
              whileHover={{ rotate: 45 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-violet-400 transition-colors">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </motion.div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col gap-3 relative z-10">
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white leading-snug transition-colors">
              {project.name}
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
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
  const containerRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, amount: 0.5 })

  // Horizontal scroll — pin section, translate strip as user scrolls
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  // Total horizontal travel = (cards × width) − viewport
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(PROJECTS.length - 1) * 440}px`])

  return (
    // Height = viewport + travel distance so pin works
    <section
      ref={containerRef}
      id="projects"
      style={{ height: `${100 + PROJECTS.length * 60}vh` }}
      className="relative"
    >
      {/* Sticky wrapper */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div ref={headRef} className="px-8 md:px-16 mb-10 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-3 block">Work</span>
            <div className="flex items-end gap-6">
              <h2 className="text-4xl font-bold text-zinc-100">
                Things I've{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">Built</span>
              </h2>
              <span className="text-zinc-600 text-sm mb-1">← Drag to explore →</span>
            </div>
          </motion.div>
        </div>

        {/* Horizontal strip */}
        <motion.div
          style={{ x }}
          className="flex gap-6 px-8 md:px-16 flex-shrink-0 will-change-transform"
        >
          {PROJECTS.map((project, i) => (
            <TiltCard key={project.name} project={project} index={i} posthog={posthog} />
          ))}
          {/* Trailing CTA card */}
          <div className="flex-shrink-0 w-[260px] flex items-center justify-center">
            <motion.a
              href="https://github.com/they-call-me-god"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 text-zinc-600 hover:text-violet-400 transition-colors group cursor-none"
              data-cursor="GITHUB"
            >
              <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-violet-500/40 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span className="text-sm font-medium">More on GitHub</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-24 h-px bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-400 rounded-full origin-left"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
