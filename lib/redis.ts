import { Redis } from '@upstash/redis'
import type { MetricsSummary, HistoryEntry } from '@/types/iteration'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const KEY = {
  version: 'portfolio:version',
  sha: 'portfolio:last_commit_sha',
  baseline: 'portfolio:baseline',
  weekCount: 'portfolio:week_count',
  history: 'portfolio:history',
}

export async function getVersion(): Promise<string> {
  return (await redis.get<string>(KEY.version)) ?? 'iteration-0'
}

export async function setVersion(v: string) {
  await redis.set(KEY.version, v)
}

export async function getLastSha(): Promise<string | null> {
  return redis.get<string>(KEY.sha)
}

export async function setLastSha(sha: string) {
  await redis.set(KEY.sha, sha)
}

export async function getBaseline(): Promise<MetricsSummary | null> {
  return redis.get<MetricsSummary>(KEY.baseline)
}

export async function setBaseline(m: MetricsSummary) {
  await redis.set(KEY.baseline, JSON.stringify(m))
}

export async function getWeekCount(): Promise<{ count: number; week: string }> {
  const stored = await redis.get<{ count: number; week: string }>(KEY.weekCount)
  const currentWeek = getISOWeek()
  if (!stored || stored.week !== currentWeek) {
    return { count: 0, week: currentWeek }
  }
  return stored
}

export async function incrementWeekCount() {
  const current = await getWeekCount()
  await redis.set(
    KEY.weekCount,
    JSON.stringify({ count: current.count + 1, week: current.week })
  )
}

export async function appendHistory(entry: HistoryEntry) {
  const existing = (await redis.get<HistoryEntry[]>(KEY.history)) ?? []
  existing.push(entry)
  if (existing.length > 50) existing.shift() // keep last 50 entries
  await redis.set(KEY.history, JSON.stringify(existing))
}

function getISOWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  )
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}
