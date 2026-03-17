'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

export function PostHogTrackers() {
  const posthog = usePostHog()
  const firedDepths = useRef<Set<number>>(new Set())

  // Fire page_viewed once on mount
  useEffect(() => {
    if (!posthog) return
    const params = new URLSearchParams(window.location.search)
    posthog.capture('page_viewed', {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      referrer: document.referrer,
      version: SITE_VERSION,
    })
  }, [posthog])

  // Scroll depth tracking
  useEffect(() => {
    if (!posthog) return

    const checkDepth = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const pct = Math.round((scrolled / total) * 100)

      for (const threshold of [25, 50, 75, 100]) {
        if (pct >= threshold && !firedDepths.current.has(threshold)) {
          firedDepths.current.add(threshold)
          posthog.capture('scroll_depth', { depth: threshold, version: SITE_VERSION })
        }
      }
    }

    window.addEventListener('scroll', checkDepth, { passive: true })
    return () => window.removeEventListener('scroll', checkDepth)
  }, [posthog])

  return null
}
