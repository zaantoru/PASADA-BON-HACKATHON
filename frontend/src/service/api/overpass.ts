// Finds hospitals and animal bite centers around a point using OpenStreetMap data,
// through the public Overpass API. https://wiki.openstreetmap.org/wiki/Overpass_API
// OpenStreetMap is volunteer-edited, so results can be incomplete or out of date.

export type FacilityKind = 'hospital' | 'abtc' | 'health_center'

export interface LatLon {
  lat: number
  lon: number
}

export interface NearbyFacility extends LatLon {
  id: string
  name: string
  kind: FacilityKind
  distanceKm: number
  address?: string
  phone?: string
  openingHours?: string
  website?: string
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: LatLon
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

// Public instances, tried in order when one is busy or slow.
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

// Give up on one instance after this long so the next one gets a turn.
const ATTEMPT_TIMEOUT_MS = 15000

const BITE_CENTER_PATTERN = /animal bite|abtc|rabies/i

export const FACILITY_KIND_LABELS: Record<FacilityKind, string> = {
  hospital: 'Hospital',
  abtc: 'Animal bite center',
  health_center: 'Health center',
}

function buildQuery({ lat, lon }: LatLon, radiusM: number): string {
  // Only numbers are interpolated, so the query cannot be altered by user input.
  const around = `around:${Math.round(radiusM)},${lat.toFixed(6)},${lon.toFixed(6)}`
  return `[out:json][timeout:25];
(
  nwr["amenity"="hospital"](${around});
  nwr["name"~"animal bite|abtc|rabies",i](${around});
  nwr["name"~"health cent(er|re)",i](${around});
);
out tags center 300;`
}

export function distanceKm(a: LatLon, b: LatLon): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function classify(tags: Record<string, string>): FacilityKind {
  const name = tags.name ?? ''
  if (BITE_CENTER_PATTERN.test(name)) return 'abtc'
  if (tags.amenity === 'hospital') return 'hospital'
  return 'health_center'
}

function formatAddress(tags: Record<string, string>): string | undefined {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
  const parts = [
    tags['addr:full'] ?? street,
    tags['addr:suburb'] ?? tags['addr:barangay'],
    tags['addr:city'] ?? tags['addr:municipality'],
    tags['addr:province'],
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : undefined
}

function toFacility(element: OverpassElement, origin: LatLon): NearbyFacility | null {
  const lat = element.lat ?? element.center?.lat
  const lon = element.lon ?? element.center?.lon
  if (lat === undefined || lon === undefined) return null

  const tags = element.tags ?? {}
  const kind = classify(tags)
  const name = tags.name ?? tags['name:en'] ?? `Unnamed ${FACILITY_KIND_LABELS[kind].toLowerCase()}`

  return {
    id: `${element.type}/${element.id}`,
    name,
    kind,
    lat,
    lon,
    distanceKm: distanceKm(origin, { lat, lon }),
    address: formatAddress(tags),
    phone: tags.phone ?? tags['contact:phone'],
    openingHours: tags.opening_hours,
    website: tags.website ?? tags['contact:website'],
  }
}

export async function fetchNearbyFacilities(
  origin: LatLon,
  radiusKm: number,
  signal?: AbortSignal,
): Promise<NearbyFacility[]> {
  const body = new URLSearchParams({ data: buildQuery(origin, radiusKm * 1000) })
  let lastError: unknown = new Error('Overpass request failed')

  for (const endpoint of ENDPOINTS) {
    try {
      const timeout = AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)
      const response = await fetch(endpoint, {
        method: 'POST',
        body,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      })
      if (!response.ok) throw new Error(`Overpass responded with ${response.status}`)

      const data = (await response.json()) as OverpassResponse
      if (!Array.isArray(data.elements)) throw new Error('Unexpected Overpass response')

      return data.elements
        .map((element) => toFacility(element, origin))
        .filter((facility): facility is NearbyFacility => facility !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm)
    } catch (error) {
      if (signal?.aborted) throw error
      lastError = error
    }
  }

  throw lastError
}
