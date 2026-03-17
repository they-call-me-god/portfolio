'use client'

import { usePostHog } from 'posthog-js/react'
import { SOCIALS } from '@/lib/content'
import { motion } from 'framer-motion'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

export function Socials() {
  const posthog = usePostHog()

  return (
    <section id="socials" className="py-32 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-10 text-zinc-100">Find Me</h2>
        <div className="flex flex-wrap gap-6">
          {SOCIALS.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                posthog?.capture('social_link_clicked', {
                  platform: social.platform,
                  destination: social.url,
                  version: SITE_VERSION,
                })
              }
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-lg font-medium underline-offset-4 hover:underline"
            >
              {social.platform}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
