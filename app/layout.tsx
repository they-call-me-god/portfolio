import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import { PostHogTrackers } from '@/components/PostHogTrackers'
import { ScrollProgress } from '@/components/ScrollProgress'
import { CustomCursor } from '@/components/CustomCursor'
import { getServerFlags } from '@/lib/posthog-flags'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { PERSONAL } from '@/lib/content'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portfolio-iota-nine-97gumluwra.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Shaurya Vardhan Shandilya — AI Automation Builder',
    template: '%s | Shaurya Shandilya',
  },
  description:
    '15-year-old AI automation builder. I build VAPI voice agents, n8n pipelines, and full-stack products that cut operational costs for small businesses. Research intern at The HEART Venture.',
  keywords: [
    'AI automation', 'VAPI voice agent', 'n8n workflow', 'AI builder India',
    'voice agent freelancer', 'automation engineer', 'lead follow-up automation',
    'ElevenLabs', 'Twilio', 'Python automation', 'Next.js developer',
    'Shaurya Shandilya', 'The HEART Venture',
  ],
  authors: [{ name: 'Shaurya Vardhan Shandilya', url: 'https://github.com/they-call-me-god' }],
  creator: 'Shaurya Vardhan Shandilya',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Shaurya Vardhan Shandilya',
    title: 'Shaurya Vardhan Shandilya — AI Automation Builder',
    description:
      '15-year-old AI automation builder. VAPI voice agents, n8n pipelines, and full-stack products that replace human labour.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Shaurya Vardhan Shandilya — AI Automation Builder',
    description:
      '15-year-old AI automation builder. VAPI voice agents, n8n pipelines, full-stack products.',
    creator: '@shauryascales',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Stable distinct ID per visitor (cookie-based for SSR flag consistency)
  const cookieStore = await cookies()
  const distinctId = cookieStore.get('ph_distinct_id')?.value ?? uuidv4()
  const bootstrapFlags = await getServerFlags(distinctId)

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 cursor-none`}>
        {/* JSON-LD — Person schema for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Shaurya Vardhan Shandilya',
              url: BASE_URL,
              image: `${BASE_URL}/avatar.jpg`,
              jobTitle: 'AI Automation Builder',
              description:
                '15-year-old AI automation builder specialising in VAPI voice agents, n8n automation pipelines, and full-stack products.',
              affiliation: {
                '@type': 'Organization',
                name: 'The HEART Venture',
                url: 'https://theheartventure.com',
              },
              sameAs: [
                'https://github.com/they-call-me-god',
                'https://linkedin.com/in/shauryalowkeygotaura',
                'https://instagram.com/shauryascales',
              ],
              knowsAbout: [
                'AI Automation', 'VAPI', 'n8n', 'ElevenLabs',
                'Twilio', 'Python', 'Next.js', 'Voice Agents',
                'Lead Generation Automation', 'CRM Integration',
              ],
            }),
          }}
        />
        <PostHogProvider bootstrapFlags={bootstrapFlags}>
          <CustomCursor />
          <ScrollProgress />
          <PostHogTrackers />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
