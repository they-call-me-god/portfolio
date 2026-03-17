import { fetchMetrics } from './posthog-metrics'
import { proposeChange, getCurrentCopy } from './gemini'
import { readFile, writeFile } from './github'
import {
  getVersion,
  setVersion,
  getLastSha,
  setLastSha,
  getBaseline,
  setBaseline,
  getWeekCount,
  incrementWeekCount,
  appendHistory,
} from './redis'
import { captureServerEvent } from './posthog'
import type { MetricsSummary, HistoryEntry } from '@/types/iteration'

const REGRESSION_THRESHOLD = 0.10 // 10%
const WEEKLY_CAP = 7
const CONTENT_FILE = 'lib/content.ts'

function isRegressed(current: MetricsSummary, baseline: MetricsSummary): string | false {
  // Not enough data to make a reliable comparison
  if (baseline.sample_size < 10) return false

  if (current.cta_click_rate < baseline.cta_click_rate * (1 - REGRESSION_THRESHOLD)) {
    return `cta_click_rate dropped from ${baseline.cta_click_rate.toFixed(3)} to ${current.cta_click_rate.toFixed(3)}`
  }
  if (current.avg_scroll_depth < baseline.avg_scroll_depth * (1 - REGRESSION_THRESHOLD)) {
    return `avg_scroll_depth dropped from ${baseline.avg_scroll_depth.toFixed(1)} to ${current.avg_scroll_depth.toFixed(1)}`
  }
  return false
}

async function triggerDeploy() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (hookUrl) {
    await fetch(hookUrl, { method: 'POST' })
  }
}

export async function runIteration(): Promise<{ status: string; detail?: string }> {
  // 1. Check weekly cap
  const weekCount = await getWeekCount()
  if (weekCount.count >= WEEKLY_CAP) {
    await appendHistory({
      version: await getVersion(),
      timestamp: new Date().toISOString(),
      result: 'skipped',
      reason: `Weekly cap reached (${weekCount.count}/${WEEKLY_CAP})`,
    })
    return { status: 'skipped', detail: `weekly cap (${weekCount.count}/${WEEKLY_CAP})` }
  }

  // 2. Fetch metrics
  const metrics = await fetchMetrics(24)
  const currentVersion = await getVersion()
  const baseline = await getBaseline()
  const lastSha = await getLastSha()

  // 3. Check for regression (only if we have a prior baseline + commit sha)
  if (baseline && lastSha) {
    const regressionReason = isRegressed(metrics, baseline)
    if (regressionReason) {
      // Rollback: restore content.ts to state at last_commit_sha
      const oldFile = await readFile(CONTENT_FILE, lastSha)
      const currentFile = await readFile(CONTENT_FILE)
      const rollbackSha = await writeFile(
        CONTENT_FILE,
        oldFile.content,
        currentFile.sha,
        `rollback: revert ${currentVersion} — ${regressionReason}`
      )

      const rollbackVersion = `rollback-${Date.now()}`
      await setVersion(rollbackVersion)
      await setLastSha(rollbackSha)
      await incrementWeekCount()
      await triggerDeploy()

      await captureServerEvent('rollback_triggered', {
        from_version: currentVersion,
        to_version: rollbackVersion,
        trigger_metric: regressionReason,
      })

      const entry: HistoryEntry = {
        version: rollbackVersion,
        timestamp: new Date().toISOString(),
        metrics_before: metrics,
        result: 'rollback',
        reason: regressionReason,
      }
      await appendHistory(entry)
      return { status: 'rollback', detail: regressionReason }
    }
  }

  // 4. Update baseline — metrics are good
  await setBaseline(metrics)

  // 5. Ask Gemini to propose one change
  const currentCopy = getCurrentCopy()
  const change = await proposeChange(metrics, currentCopy)

  if (!change) {
    await incrementWeekCount()
    await appendHistory({
      version: currentVersion,
      timestamp: new Date().toISOString(),
      result: 'parse_failure',
      reason: 'Gemini returned unparseable or invalid output',
    })
    return { status: 'parse_failure' }
  }

  // 6. Apply change to lib/content.ts via GitHub Contents API
  const { content: fileContent, sha: fileSha } = await readFile(CONTENT_FILE)

  // Replace the specific field value in content.ts
  // Matches:  fieldName: 'old value',  or  fieldName: "old value",
  const fieldKey =
    change.change_type === 'headline'
      ? 'headline'
      : change.change_type === 'cta'
        ? 'cta'
        : 'tagline'

  const escapedOld = change.old_value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `(${fieldKey}:\\s*['"])${escapedOld}(['",])`,
    'g'
  )
  const updatedContent = fileContent.replace(pattern, `$1${change.new_value}$2`)

  if (updatedContent === fileContent) {
    // old_value didn't match — skip gracefully
    await incrementWeekCount()
    await appendHistory({
      version: currentVersion,
      timestamp: new Date().toISOString(),
      result: 'parse_failure',
      reason: `old_value "${change.old_value}" not found in ${CONTENT_FILE}`,
    })
    return { status: 'parse_failure', detail: 'old_value not matched in file' }
  }

  const newVersion = `iteration-${Date.now()}`
  const newSha = await writeFile(
    CONTENT_FILE,
    updatedContent,
    fileSha,
    `iter: ${change.change_type} — ${change.reason}`
  )

  await setVersion(newVersion)
  await setLastSha(newSha)
  await incrementWeekCount()
  await triggerDeploy()

  await captureServerEvent('iteration_deployed', {
    version: newVersion,
    change_type: change.change_type,
    metric_before: JSON.stringify(metrics),
    change_reason: change.reason,
  })

  const entry: HistoryEntry = {
    version: newVersion,
    timestamp: new Date().toISOString(),
    change,
    metrics_before: metrics,
    result: 'deployed',
  }
  await appendHistory(entry)

  return {
    status: 'deployed',
    detail: `${change.change_type}: "${change.old_value}" → "${change.new_value}"`,
  }
}
