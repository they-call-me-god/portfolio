'use client'

import { usePostHog } from 'posthog-js/react'
import { CONTACT } from '@/lib/content'
import { motion } from 'framer-motion'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

type ContactMethod = 'linkedin' | 'instagram' | 'email'

const LINKS: { method: ContactMethod; label: string; href: string }[] = [
  { method: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin },
  { method: 'instagram', label: 'Instagram', href: CONTACT.instagram },
  { method: 'email', label: 'Email', href: `mailto:${CONTACT.email}` },
]

export function Contact() {
  const posthog = usePostHog()

  return (
    <section id="contact" className="py-32 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-10 text-zinc-100">Contact</h2>
        <div className="flex flex-wrap gap-4">
          {LINKS.map(({ method, label, href }) => (
            <a
              key={method}
              href={href}
              target={method !== 'email' ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={() =>
                posthog?.capture('contact_link_clicked', {
                  method,
                  version: SITE_VERSION,
                })
              }
              className="px-6 py-3 border border-zinc-700 rounded-full text-zinc-300 hover:border-zinc-400 hover:text-zinc-100 transition-colors font-medium"
            >
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
