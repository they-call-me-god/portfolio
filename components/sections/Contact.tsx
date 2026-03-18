'use client'

import { usePostHog } from 'posthog-js/react'
import { CONTACT } from '@/lib/content'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

type ContactMethod = 'linkedin' | 'instagram' | 'email'

const LINKS: { method: ContactMethod; label: string; href: string; icon: string }[] = [
  {
    method: 'linkedin',
    label: 'LinkedIn',
    href: CONTACT.linkedin,
    icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    method: 'instagram',
    label: 'Instagram',
    href: CONTACT.instagram,
    icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z',
  },
  {
    method: 'email',
    label: 'Email',
    href: `mailto:${CONTACT.email}`,
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
]

export function Contact() {
  const posthog = usePostHog()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} id="contact" className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        >
          <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4 block">Contact</span>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Let's build<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">something real.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
            I work with businesses that need AI voice agents, automation pipelines, and systems that actually run.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {LINKS.map(({ method, label, href, icon }, i) => (
              <motion.a
                key={method}
                href={href}
                target={method !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => posthog?.capture('contact_link_clicked', { method, version: SITE_VERSION })}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-full text-zinc-300 hover:text-white transition-colors font-medium group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-violet-400 transition-colors">
                  <path d={icon} />
                </svg>
                {label}
              </motion.a>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-12 text-zinc-600 text-sm"
          >
            {CONTACT.email}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
