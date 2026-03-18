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
  },
  {
    client: 'eCommerce Brand',
    category: 'Lead Follow-Up Automation',
    result: 'Automated 100% of inbound lead follow-ups',
    detail: 'n8n pipeline that triggers WhatsApp + email sequences on new leads. Reminder loops, status tracking, zero manual intervention required.',
    tags: ['n8n', 'WhatsApp API', 'Email'],
    metric: '100%',
    metricLabel: 'follow-ups automated',
  },
  {
    client: 'Agency Client',
    category: 'High-Conversion Landing Page',
    result: '3D animated landing page built for cold traffic',
    detail: 'Interactive hero section with 3D elements, integrated lead capture, and mobile-first layout. Designed to convert cold paid traffic.',
    tags: ['Next.js', 'Three.js', 'UI/UX'],
    metric: '3D',
    metricLabel: 'interactive hero, mobile-first',
  },
  {
    client: 'Content Business',
    category: 'SEO Intelligence Pipeline',
    result: 'Fully automated competitor SEO research',
    detail: 'n8n workflow that scans competitor URLs, extracts keyword patterns, and generates ready-to-publish content outlines via AI — weekly, hands-free.',
    tags: ['n8n', 'SEO', 'AI', 'Python'],
    metric: '0h',
    metricLabel: 'manual SEO research weekly',
  },
]

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
        {WORK.map((item, i) => (
          <WorkCard key={item.category} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
