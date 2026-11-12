import type { AssistanceOffice, Facility, PlaceOption } from '@/types/index'
import { assistanceOffices } from '@/mocks/assistanceOffices'
import { allFacilities, demoPlaces } from '@/mocks/facilities'
import { wait } from '@/service/mockConfig'
import { prototypeFlags } from '@/service/prototypeFlags'

/** Facility directory adapter (demo + sourced entries). Replace with the backend facilities endpoint. */
export async function listFacilities(): Promise<Facility[]> {
  await wait(700)
  return allFacilities
}

/** Assistance office adapter. Replace with the backend assistance endpoint. */
export async function listAssistanceOffices(): Promise<AssistanceOffice[]> {
  await wait(650)
  if (prototypeFlags.get().assistanceUnavailable) throw new Error('Assistance results are unavailable right now.')
  return assistanceOffices
}

export function facilityNames() {
  return allFacilities.map((f) => f.name)
}

/** Trusted lookup used by the guide: only returns facilities that exist in app data. */
export function findFacilityByName(name: string | null | undefined) {
  if (!name) return null
  const n = name.trim().toLowerCase()
  return allFacilities.find((f) => f.name.toLowerCase() === n) ?? null
}

export const facilityById = (id: string) => allFacilities.find((f) => f.id === id) ?? null
export const assistanceById = (id: string) => assistanceOffices.find((o) => o.id === id) ?? null

/** Matches a user-confirmed location string to a known area, without guessing beyond the list. */
export function matchPlace(text: string | null | undefined): PlaceOption | null {
  if (!text) return null
  const t = text.toLowerCase()
  const byLength = [...demoPlaces].sort((a, b) => b.name.length - a.name.length)
  return byLength.find((p) => t.includes(p.name.split(',')[0].toLowerCase())) ?? null
}

export async function searchPlaces(query: string): Promise<PlaceOption[]> {
  await wait(150)
  const q = query.trim().toLowerCase()
  return q ? demoPlaces.filter((p) => p.name.toLowerCase().includes(q)) : demoPlaces
}

export function averageRating(f: Facility) {
  if (!f.reviews.length) return null
  return f.reviews.reduce((sum, r) => sum + r.rating, 0) / f.reviews.length
}
