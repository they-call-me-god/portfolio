import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Projects } from '@/components/sections/Projects'
import { Contact } from '@/components/sections/Contact'
import { Marquee } from '@/components/Marquee'
import { getServerFlags } from '@/lib/posthog-flags'
import { cookies } from 'next/headers'

export default async function HomePage() {
  const cookieStore = await cookies()
  const distinctId = cookieStore.get('ph_distinct_id')?.value ?? 'anonymous'
  const flags = await getServerFlags(distinctId)
  const headlineVariant = flags['hero-headline'] === 'test' ? 'test' : 'control'

  return (
    <main>
      <Hero headlineVariant={headlineVariant} />
      <Marquee />
      <About />
      <Projects />
      <Contact />
    </main>
  )
}
