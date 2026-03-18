import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { ThreeCanvasWrapper } from '@/components/ThreeCanvasWrapper'
import { getServerFlags } from '@/lib/posthog-flags'
import { cookies } from 'next/headers'

// Below-fold sections: code-split so their JS loads after the hero is interactive
const Marquee  = dynamic(() => import('@/components/Marquee').then(m => ({ default: m.Marquee })))
const About    = dynamic(() => import('@/components/sections/About').then(m => ({ default: m.About })))
const Projects = dynamic(() => import('@/components/sections/Projects').then(m => ({ default: m.Projects })))
const Work     = dynamic(() => import('@/components/sections/Work').then(m => ({ default: m.Work })))
const Contact  = dynamic(() => import('@/components/sections/Contact').then(m => ({ default: m.Contact })))

export default async function HomePage() {
  const cookieStore = await cookies()
  const distinctId = cookieStore.get('ph_distinct_id')?.value ?? 'anonymous'
  const flags = await getServerFlags(distinctId)
  const headlineVariant = flags['hero-headline'] === 'test' ? 'test' : 'control'

  return (
    <>
      {/* Real Three.js WebGL canvas — fixed behind everything, pointer-events: none */}
      <ThreeCanvasWrapper />

      {/* Main content — positioned above the WebGL layer */}
      <main className="relative" style={{ zIndex: 1 }}>
        <Hero headlineVariant={headlineVariant} />
        <Marquee />
        <About />
        <Projects />
        <Work />
        <Contact />
      </main>
    </>
  )
}
