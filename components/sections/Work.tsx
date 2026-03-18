'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const WORK = [
  {
    client: 'Local Service Business',
    category: 'AI Voice Agent',
    result: 'Cut inbound call handling from 8 min → 45 sec',
    detail: 'Built a VAPI voice receptionist that handles lead qualification, appointment booking, and CRM logging end-to-end. Zero human needed for 80% of calls.',
    tags: ['VAPI', 'Twilio', 'n8n', 'CRM'],
    metric: '90%',
    metricLabel: 'reduction in manual call time',
    featured: false,
  },
  {
    client: 'eCommerce Brand',
    category: 'Lead Follow-Up Automation',
    result: 'Automated 100% of inbound lead follow-ups',
    detail: 'n8n pipeline that triggers WhatsApp + email sequences on new leads. Reminder loops, status tracking, zero manual intervention required.',
    tags: ['n8n', 'WhatsApp API', 'Email'],
    metric: '100%',
    metricLabel: 'follow-ups automated',
    featured: false,
  },
  {
    client: 'Agency Client',
    category: 'High-Conversion Landing Page',
    result: '3D animated landing page built for cold traffic',
    detail: 'Interactive hero section with 3D elements, integrated lead capture, and mobile-first layout. Designed to convert cold paid traffic.',
    tags: ['Next.js', 'Three.js', 'UI/UX'],
    metric: '3D',
    metricLabel: 'interactive hero, mobile-first',
    featured: false,
  },
  {
    client: 'Content Business',
    category: 'SEO Intelligence Pipeline',
    result: 'Fully automated competitor SEO research',
    detail: 'n8n workflow that scans competitor URLs, extracts keyword patterns, and generates ready-to-publish content outlines via AI — weekly, hands-free.',
    tags: ['n8n', 'SEO', 'AI', 'Python'],
    metric: '0h',
    metricLabel: 'manual SEO research weekly',
    featured: false,
  },
]

const HEART_VENTURE = {
  org: 'The HEART Venture',
  role: 'Research Intern',
  quote: 'Shaurya isn\'t just a builder — he\'s a systems thinker. He came in as a 15-year-old and immediately started mapping AI workflows we hadn\'t even scoped yet. The output quality and the speed at which he shipped were genuinely surprising.',
  attribution: 'The HEART Venture — Research & Innovation Lab',
  tags: ['AI Research', 'Systems Design', 'Automation', 'Workflow Engineering'],
  highlight: 'Research Intern — mapping & building AI systems for the innovation lab',
}

function WorkCard({ item, index }: { item: typeof WORK[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] }}
      className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition-colors duration-300 overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(153,27,27,0.1) 0%, transparent 60%)' }} />

      <div className="relative z-10 flex flex-col gap-5 h-full">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-red-500 text-xs font-medium uppercase tracking-widest">{item.category}</span>
            <h3 className="text-zinc-100 font-semibold text-base mt-1 leading-snug">{item.result}</h3>
          </div>
          {/* Big metric */}
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-white leading-none">{item.metric}</div>
            <div className="text-zinc-600 text-[10px] uppercase tracking-wide mt-0.5 max-w-[100px] text-right">{item.metricLabel}</div>
          </div>
        </div>

        {/* Detail */}
        <p className="text-zinc-500 text-sm leading-relaxed">{item.detail}</p>

        {/* Tags + client */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/50 text-zinc-400 text-xs rounded-full">{tag}</span>
            ))}
          </div>
          <span className="text-zinc-600 text-xs">{item.client}</span>
        </div>
      </div>
    </motion.div>
  )
}

function HeartVentureCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] }}
      className="group relative w-full bg-zinc-900/60 border border-red-900/30 rounded-2xl p-8 overflow-hidden transition-colors duration-300 hover:border-red-800/50"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(153,27,27,0.18) 0%, transparent 60%)' }} />

      <div className="relative z-10 flex flex-col md:flex-row gap-8">
        {/* Left: org badge + quote */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            {/* HEART logo mark */}
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.621 3.68 1 7.082 1c2.199 0 4.014 1.169 4.918 2.97C12.904 2.169 14.719 1 16.918 1 20.32 1 23 3.621 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
              </svg>
            </div>
            <div>
              <div className="text-zinc-100 font-semibold text-sm">{HEART_VENTURE.org}</div>
              <div className="text-red-500 text-xs font-medium uppercase tracking-widest">{HEART_VENTURE.role}</div>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-900/60 mb-2">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p className="text-zinc-300 text-base leading-relaxed italic">
              {HEART_VENTURE.quote}
            </p>
            <div className="mt-3 text-zinc-600 text-xs">{HEART_VENTURE.attribution}</div>
          </blockquote>
        </div>

        {/* Right: highlight + tags */}
        <div className="md:w-64 flex flex-col justify-between gap-5 flex-shrink-0">
          <div className="bg-red-950/20 border border-red-900/20 rounded-xl p-4">
            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">What I did</div>
            <p className="text-zinc-300 text-sm leading-snug">{HEART_VENTURE.highlight}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {HEART_VENTURE.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-red-950/20 border border-red-900/20 text-red-400/70 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Work() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} id="work" className="py-32 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <span className="text-red-500 text-sm font-medium tracking-widest uppercase mb-3 block">Results</span>
        <h2 className="text-4xl font-bold text-zinc-100">
          Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Work</span>
        </h2>
        <p className="text-zinc-500 mt-3 text-base max-w-lg">Real systems. Real clients. Not demos.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Featured testimonial — full width */}
        <div className="col-span-1 md:col-span-2">
          <HeartVentureCard index={0} />
        </div>

        {/* Work cards */}
        {WORK.map((item, i) => (
          <WorkCard key={item.category} item={item} index={i + 1} />
        ))}
      </div>
    </section>
  )
}
