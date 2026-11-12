import { useEffect, useState } from 'react'
import { fetchNearbyFacilities } from '../service/api/overpass'
import type { NearbyFacility } from '../service/api/overpass'

const NO_FACILITIES: NearbyFacility[] = []

interface Result {
  key: string | null
  facilities: NearbyFacility[]
  failed: boolean
}

/**
 * Loads facilities around a point. Loading is derived from comparing the finished
 * request with the current search, so a new search never shows the previous results
 * as if they belonged to it.
 */
export function useNearbyFacilities(lat: number, lon: number, radiusKm: number) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result>({ key: null, facilities: NO_FACILITIES, failed: false })

  const key = `${lat.toFixed(5)},${lon.toFixed(5)},${radiusKm}#${attempt}`

  useEffect(() => {
    const controller = new AbortController()

    fetchNearbyFacilities({ lat, lon }, radiusKm, controller.signal).then(
      (facilities) => setResult({ key, facilities, failed: false }),
      () => {
        if (!controller.signal.aborted) setResult({ key, facilities: NO_FACILITIES, failed: true })
      },
    )

    return () => controller.abort()
  }, [key, lat, lon, radiusKm])

  const settled = result.key === key

  return {
    facilities: settled ? result.facilities : NO_FACILITIES,
    loading: !settled,
    failed: settled && result.failed,
    retry: () => setAttempt((current) => current + 1),
  }
}
