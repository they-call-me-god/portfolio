'use client'

import { usePostHog } from 'posthog-js/react'
import { PROJECTS } from '@/lib/content'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

function DepthCard({ project, index, posthog }: { project: typeof PROJECTS[0]; index: number; posthog: ReturnType<typeof usePostHog> }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)

  const isPrivate = project.private === true

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top) / rect.height
    rotateX.set(-(ny - 0.5) * 18)
    rotateY.set((nx - 0.5) * 18)
    glowX.set(nx * 100)
    glowY.set(ny * 100)
  }
  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  const entryRotateY = index % 2 === 0 ? -30 : 30
  const entryX = index % 2 === 0 ? -60 : 60

  const cardInner = (
    <div className={`relative h-full bg-zinc-900/90 border rounded-3xl p-8 overflow-hidden transition-colors duration-300 backdrop-blur-sm flex flex-col gap-4 min-h-[260px] ${
      isPrivate
        ? 'border-zinc-800/60 group-hover:border-zinc-700'
        : 'border-zinc-800 group-hover:border-red-800/50'
    }`}>
      {/* Dynamic spotlight */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(153,27,27,0.18) 0%, transparent 55%)`
          ),
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <span className="text-5xl font-black text-zinc-800 group-hover:text-red-950/70 transition-colors select-none leading-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        {isPrivate ? (
          /* Private badge — no link, lock icon */
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-700/50 bg-zinc-800/60">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wide">Private</span>
          </div>
        ) : (
          /* Public repo — arrow icon */
          <motion.div
            className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-colors flex-shrink-0"
            whileHover={{ rotate: 45 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-red-500 transition-colors">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </motion.div>
        )}
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
  )

  const motionProps = {
    initial: { rotateY: entryRotateY, x: entryX, opacity: 0, scale: 0.88 },
    animate: inView ? { rotateY: 0, x: 0, opacity: 1, scale: 1 } : {},
    transition: { duration: 0.85, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] },
    style: { rotateX, rotateY, transformStyle: 'preserve-3d' as const },
    whileHover: { scale: 1.025 },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: 'group block',
  }

  return (
    <div ref={ref} style={{ perspective: '1400px' }}>
      {isPrivate ? (
        <motion.div {...motionProps} className="group block cursor-default">
          {cardInner}
        </motion.div>
      ) : (
        <motion.a
          {...motionProps}
          href={project.url!}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="VIEW"
          className="group block cursor-none"
          onClick={() => posthog?.capture('project_card_clicked', { project_name: project.name, version: SITE_VERSION })}
        >
          {cardInner}
        </motion.a>
      )}
    </div>
  )
}

export function Projects() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const sectionRotateX = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [16, 0, 0, -6])
  const sectionY = useTransform(scrollYProgress, [0, 0.2], [70, 0])
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} id="projects" className="py-20 md:py-32 px-6 max-w-6xl mx-auto" style={{ perspective: '1400px' }}>
      <motion.div style={{ rotateX: sectionRotateX, y: sectionY, opacity: sectionOpacity, transformStyle: 'preserve-3d' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="text-red-500 text-sm font-medium tracking-widest uppercase mb-3 block">Code</span>
          <h2 className="text-4xl font-bold text-zinc-100">
            Things I've <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Built</span>
          </h2>
          <p className="text-zinc-500 mt-3 text-base max-w-lg">Public repos + client builds. Client work is private by nature.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROJECTS.map((project, i) => (
            <DepthCard key={project.name} project={project} index={i} posthog={posthog} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
