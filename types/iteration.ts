export type ChangeType = 'headline' | 'cta' | 'tagline'

export interface IterationChange {
  change_type: ChangeType
  target_file: string
  old_value: string
  new_value: string
  reason: string
}

export interface MetricsSummary {
  cta_click_rate: number
  avg_scroll_depth: number
  bounce_rate: number
  contact_clicks: number
  project_clicks: number
  sample_size: number
}

export interface IterationState {
  version: string
  last_commit_sha: string
  baseline: MetricsSummary
  week_count: { count: number; week: string }
  history: HistoryEntry[]
}

export interface HistoryEntry {
  version: string
  timestamp: string
  change?: IterationChange
  metrics_before?: MetricsSummary
  result: 'deployed' | 'rollback' | 'skipped' | 'parse_failure'
  reason?: string
}
