import type { HotspotArea, HotspotAnimal, ReportPeriod } from '@/types/index'
import { demoHotspots } from '@/mocks/hotspots'
import { wait } from '@/service/mockConfig'

/** Demo, anonymized area-level reports. Replace with the backend aggregate endpoint. */
export async function listHotspots(): Promise<HotspotArea[]> {
  await wait(600)
  return demoHotspots
}

export function countFor(area: HotspotArea, period: ReportPeriod, animal: HotspotAnimal) {
  const r = area.reports[period]
  return animal === 'dog' ? r.dog : animal === 'cat' ? r.cat : r.dog + r.cat
}

export type HotspotLevel = 'fewer' | 'moderate' | 'more'

/** Levels are relative to the busiest area in the current view. */
export function levelFor(count: number, max: number): HotspotLevel {
  if (max <= 0) return 'fewer'
  const ratio = count / max
  return ratio >= 0.66 ? 'more' : ratio >= 0.33 ? 'moderate' : 'fewer'
}

export const periodLabels: Record<ReportPeriod, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
}
