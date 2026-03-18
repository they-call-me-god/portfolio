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

export const metadata: Metadata = {
  title: PERSONAL.name,
  description: PERSONAL.tagline,
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
