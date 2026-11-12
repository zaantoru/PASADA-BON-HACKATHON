import type { PlaceOption } from '@/types/index'
import { wait } from '@/service/mockConfig'

/**
 * Anonymized animal-bite report. Contains only an approximate area, animal type, and month —
 * never names, card images, or medical details. These are bite reports, not rabies cases.
 */
export interface CommunityReport {
  areaId: string
  areaName: string
  animal: 'dog' | 'cat' | 'other' | 'unknown'
  month: string
}

const KEY = 'pasada-ligtas:community-demo:v1'

export function buildReport(place: PlaceOption, animal: string | null, exposureDate: string | null): CommunityReport {
  const a = animal === 'dog' || animal === 'cat' || animal === 'other' ? animal : 'unknown'
  return { areaId: place.id, areaName: place.name, animal: a, month: (exposureDate ?? '').slice(0, 7) }
}

/** Demo adapter: stores the report on this device only. There is no live or public submission. */
export async function submitCommunityReport(r: CommunityReport): Promise<{ status: 'saved_on_device_demo' }> {
  await wait(600)
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as CommunityReport[]
    localStorage.setItem(KEY, JSON.stringify([...list, r]))
  } catch {
    // Ignore storage errors in the demo.
  }
  return { status: 'saved_on_device_demo' }
}
