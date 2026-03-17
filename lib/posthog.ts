import { PostHog } from 'posthog-node'

export const POSTHOG_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

let _client: PostHog | null = null

export function getPostHogClient(): PostHog {
  if (!_client) {
    _client = new PostHog(process.env.POSTHOG_PERSONAL_API_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  }
  return _client
}

export async function captureServerEvent(
  event: string,
  properties: Record<string, unknown> = {}
) {
  const client = getPostHogClient()
  client.capture({
    distinctId: 'server',
    event,
    properties: { ...properties, version: POSTHOG_VERSION },
  })
  await client.flush()
}
