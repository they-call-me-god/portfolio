import { getPostHogClient } from './posthog'

export async function getServerFlags(
  distinctId: string
): Promise<Record<string, string | boolean>> {
  try {
    const client = getPostHogClient()
    const flags = await client.getAllFlags(distinctId)
    return flags ?? {}
  } catch {
    // Never block rendering on flag fetch failure
    return {}
  }
}
