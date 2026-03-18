'use client'

import { motion } from 'framer-motion'

const ITEMS = [
  'AI Voice Agents', 'n8n Automation', 'VAPI', 'ElevenLabs', 'Twilio',
  'Lead Qualification', 'Python', 'Next.js', 'WhatsApp API', 'Gemini Flash',
  'Revenue Engineering', 'CRM Automation', 'Cold Traffic Conversion', 'SEO Intelligence',
]

const ITEMS2 = [
  '15 Years Old', 'Based in India', 'Research Intern @ HEART Venture', 'Open to Remote',
  'Ships Real Products', 'Not Side Projects', 'AI Automation', 'Voice AI',
  'Building Since 2023', 'Serious Enquiries Only',
]

function Strip({ items, direction = 1, speed = 35 }: { items: string[]; direction?: 1 | -1; speed?: number }) {
  const repeated = [...items, ...items, ...items]
  const duration = (items.length * speed) / 10

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-6 w-max"
        animate={{ x: direction === 1 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {repeated.map((item, i) => (
          <div key={i} className="flex items-center gap-6 flex-shrink-0">
            <span className="text-sm font-medium tracking-wide text-zinc-500 whitespace-nowrap uppercase">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-violet-600 flex-shrink-0" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function Marquee() {
  return (
    <div className="py-10 border-y border-zinc-800/60 space-y-4 overflow-hidden select-none">
      <Strip items={ITEMS} direction={1} speed={40} />
      <Strip items={ITEMS2} direction={-1} speed={38} />
    </div>
  )
}
