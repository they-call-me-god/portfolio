import type { MetricsSummary } from '@/types/iteration'

const BASE = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY!
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID!

interface PHEvent {
  event: string
  properties: Record<string, unknown>
  timestamp: string
  distinct_id: string
}

export async function fetchMetrics(hours = 24): Promise<MetricsSummary> {
  const after = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const events = await fetchEvents(after)

  // Group by pseudo-session (distinct_id + date)
  const sessions = new Map<string, Set<string>>()
  const scrollDepths: number[] = []
  let ctaClicks = 0
  let pageViews = 0
  let contactClicks = 0
  let projectClicks = 0

  for (const e of events) {
    const sessionKey = `${e.distinct_id}:${e.timestamp.slice(0, 10)}`
    if (!sessions.has(sessionKey)) sessions.set(sessionKey, new Set())
    sessions.get(sessionKey)!.add(e.event)

    switch (e.event) {
      case 'page_viewed':
        pageViews++
        break
      case 'hero_cta_clicked':
        ctaClicks++
        break
      case 'contact_link_clicked':
        contactClicks++
        break
      case 'project_card_clicked':
        projectClicks++
        break
      case 'scroll_depth':
        scrollDepths.push(Number(e.properties.depth ?? 0))
        break
    }
  }

  // Derived bounce rate: sessions where user only had page_viewed + no meaningful scroll
  let bounces = 0
  for (const [, eventSet] of sessions) {
    const noScroll = !eventSet.has('scroll_depth')
    const noCta = !eventSet.has('hero_cta_clicked')
    const noContact = !eventSet.has('contact_link_clicked')
    if (noScroll && noCta && noContact) bounces++
  }

  return {
    cta_click_rate: pageViews > 0 ? ctaClicks / pageViews : 0,
    avg_scroll_depth:
      scrollDepths.length > 0
        ? scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length
        : 0,
    bounce_rate: sessions.size > 0 ? bounces / sessions.size : 0,
    contact_clicks: contactClicks,
    project_clicks: projectClicks,
    sample_size: pageViews,
  }
}

async function fetchEvents(after: string): Promise<PHEvent[]> {
  const url = `${BASE}/api/projects/${PROJECT_ID}/events/?after=${encodeURIComponent(after)}&limit=1000`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`PostHog API error: ${res.status}`)
  const data = await res.json()
  return (data.results ?? []) as PHEvent[]
}
