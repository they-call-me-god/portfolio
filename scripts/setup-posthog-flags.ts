/**
 * Run once to create the hero-headline feature flag in PostHog.
 *
 * Usage:
 *   npx ts-node -r dotenv/config scripts/setup-posthog-flags.ts dotenv_config_path=.env.local
 *
 * Requires: npm install --save-dev ts-node dotenv
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function createHeroHeadlineFlag() {
  const BASE = process.env.NEXT_PUBLIC_POSTHOG_HOST
  const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY
  const PROJECT_ID = process.env.POSTHOG_PROJECT_ID

  if (!BASE || !API_KEY || !PROJECT_ID) {
    console.error('Missing env vars. Check NEXT_PUBLIC_POSTHOG_HOST, POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID in .env.local')
    process.exit(1)
  }

  const res = await fetch(`${BASE}/api/projects/${PROJECT_ID}/feature_flags/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Hero Headline A/B Test',
      key: 'hero-headline',
      active: true,
      filters: {
        groups: [
          {
            properties: [],
            rollout_percentage: 100,
          },
        ],
        multivariate: {
          variants: [
            { key: 'control', rollout_percentage: 50 },
            { key: 'test', rollout_percentage: 50 },
          ],
        },
      },
    }),
  })

  const data = await res.json()
  if (res.ok) {
    console.log('✅ Feature flag created:', data.key)
    console.log('   View in PostHog: Feature Flags → hero-headline')
  } else {
    console.log('⚠️  Response:', JSON.stringify(data, null, 2))
    console.log('   Flag may already exist — check PostHog dashboard → Feature Flags')
  }
}

createHeroHeadlineFlag().catch(console.error)
