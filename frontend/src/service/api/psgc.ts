// Philippine Standard Geographic Code (PSGC) lookups, served by the open PSGC API.
// https://psgc.gitlab.io/api/

const BASE_URL = 'https://psgc.gitlab.io/api'

export interface PsgcItem {
  code: string
  name: string
}

interface RawPsgcItem {
  code: string
  name: string
  regionName?: string
}

export const psgcPaths = {
  regions: '/regions/',
  provinces: (regionCode: string) => `/regions/${regionCode}/provinces/`,
  // Regions without provinces (for example NCR) list their cities directly.
  regionCities: (regionCode: string) => `/regions/${regionCode}/cities-municipalities/`,
  provinceCities: (provinceCode: string) => `/provinces/${provinceCode}/cities-municipalities/`,
  barangays: (cityCode: string) => `/cities-municipalities/${cityCode}/barangays/`,
}

const cache = new Map<string, Promise<PsgcItem[]>>()

function toItem(raw: RawPsgcItem, isRegion: boolean): PsgcItem {
  // "CALABARZON (Region IV-A)"; skip the suffix when both names are the same.
  const label =
    isRegion && raw.regionName && raw.regionName !== raw.name
      ? `${raw.name} (${raw.regionName})`
      : raw.name
  return { code: raw.code, name: label }
}

export function fetchPsgcList(path: string): Promise<PsgcItem[]> {
  const cached = cache.get(path)
  if (cached) return cached

  const isRegion = path === psgcPaths.regions
  const request = fetch(`${BASE_URL}${path}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`PSGC request failed (${response.status})`)
      const data: unknown = await response.json()
      if (!Array.isArray(data)) throw new Error('Unexpected PSGC response')

      const items = (data as RawPsgcItem[]).map((raw) => toItem(raw, isRegion))
      // The API lists regions in geographic order, so keep that. Sort everything else by name.
      return isRegion
        ? items
        : items.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
    })
    .catch((error: unknown) => {
      cache.delete(path) // do not cache failures, so a retry can succeed
      throw error
    })

  cache.set(path, request)
  return request
}
