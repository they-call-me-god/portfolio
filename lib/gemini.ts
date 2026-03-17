import { GoogleGenerativeAI } from '@google/generative-ai'
import type { IterationChange, MetricsSummary } from '@/types/iteration'
import { PERSONAL } from './content'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function proposeChange(
  metrics: MetricsSummary,
  currentCopy: { headline: string; cta: string; tagline: string }
): Promise<IterationChange | null> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a conversion optimizer for a personal portfolio website.

Current metrics (last 24h):
${JSON.stringify(metrics, null, 2)}

Current copy:
- Hero headline: "${currentCopy.headline}"
- Hero CTA: "${currentCopy.cta}"
- Bio tagline: "${currentCopy.tagline}"

Propose EXACTLY ONE change. Return valid JSON only, no markdown, no code blocks:
{"change_type":"headline","target_file":"lib/content.ts","old_value":"exact current string","new_value":"proposed replacement max 12 words","reason":"one sentence based on metrics"}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Strip markdown code fences if Gemini wraps in them despite instructions
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const change = JSON.parse(cleaned) as IterationChange

    // Validate required fields and allowed change types
    if (!['headline', 'cta', 'tagline'].includes(change.change_type)) return null
    if (!change.old_value || !change.new_value || !change.reason) return null
    if (change.new_value.split(' ').length > 12) return null

    return change
  } catch {
    return null
  }
}

export function getCurrentCopy(): { headline: string; cta: string; tagline: string } {
  return {
    headline: PERSONAL.headline,
    cta: PERSONAL.cta,
    tagline: PERSONAL.tagline,
  }
}
