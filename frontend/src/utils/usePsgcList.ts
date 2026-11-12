import { useEffect, useState } from 'react'
import { fetchPsgcList } from '../service/api/psgc'
import type { PsgcItem } from '../service/api/psgc'

const NO_ITEMS: PsgcItem[] = []

interface Result {
  key: string | null
  items: PsgcItem[]
  failed: boolean
}

/**
 * Loads one PSGC list. Pass `null` while the parent selection is empty.
 * Loading is derived by comparing the finished request with the current path,
 * so changing the path never shows stale options from the previous parent.
 */
export function usePsgcList(path: string | null) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result>({ key: null, items: NO_ITEMS, failed: false })

  const key = path === null ? null : `${path}#${attempt}`

  useEffect(() => {
    if (key === null || path === null) return

    let ignore = false
    fetchPsgcList(path).then(
      (items) => {
        if (!ignore) setResult({ key, items, failed: false })
      },
      () => {
        if (!ignore) setResult({ key, items: NO_ITEMS, failed: true })
      },
    )
    return () => {
      ignore = true
    }
  }, [key, path])

  const settled = key !== null && result.key === key

  return {
    items: settled ? result.items : NO_ITEMS,
    loading: key !== null && !settled,
    failed: settled && result.failed,
    retry: () => setAttempt((current) => current + 1),
  }
}
