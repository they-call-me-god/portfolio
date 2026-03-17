'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({
  children,
  bootstrapFlags,
}: {
  children: React.ReactNode
  bootstrapFlags: Record<string, string | boolean>
}) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      bootstrap: { featureFlags: bootstrapFlags },
      capture_pageview: false, // fired manually in PostHogTrackers with version property
      persistence: 'localStorage+cookie',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
