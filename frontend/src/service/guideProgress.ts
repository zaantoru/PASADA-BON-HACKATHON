import { useCallback, useEffect, useState } from 'react'
import type { GuideContent, Lang } from '@/features/documents/guide/types'

/** Per-document guide state, stored on this device only. */
export interface ReminderPref {
  appointmentDate: string
  remindOn: string
  time: string
  browserNotifications: boolean
  savedAt: string
}

export interface PreferredOption {
  kind: 'facility' | 'assistance'
  id: string
  name: string
  savedAt: string
}

export interface GuideProgress {
  lang: Lang
  tour: { status: 'not_started' | 'in_progress' | 'completed' | 'skipped'; step: number }
  overviewSeen: boolean
  assistance: 'pending' | 'accepted' | 'dismissed'
  preferred: PreferredOption | null
  reminder: ReminderPref | null
  community: 'pending' | 'shared' | 'skipped'
  content: Partial<Record<Lang, GuideContent>>
}

const KEY = (id: string) => `pasada-ligtas:guide:v1:${id}`
const EVENT = 'pasada-guide-progress'

const defaults = (): GuideProgress => ({
  lang: 'en',
  tour: { status: 'not_started', step: 0 },
  overviewSeen: false,
  assistance: 'pending',
  preferred: null,
  reminder: null,
  community: 'pending',
  content: {},
})

function read(id: string): GuideProgress {
  try {
    const raw = localStorage.getItem(KEY(id))
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults()
  } catch {
    return defaults()
  }
}

export const guideProgress = {
  get: read,
  init(id: string) {
    if (!localStorage.getItem(KEY(id))) localStorage.setItem(KEY(id), JSON.stringify(defaults()))
  },
  update(id: string, patch: Partial<GuideProgress> | ((p: GuideProgress) => Partial<GuideProgress>)) {
    const cur = read(id)
    const next = { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) }
    try {
      localStorage.setItem(KEY(id), JSON.stringify(next))
    } catch {
      // Storage full: keep progress, drop cached guide text (it can be regenerated).
      localStorage.setItem(KEY(id), JSON.stringify({ ...next, content: {} }))
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: id }))
    return next
  },
}

type GuideProgressPatch = Parameters<typeof guideProgress.update>[1]

export function useGuideProgress(id: string) {
  const [state, setState] = useState(() => read(id))
  useEffect(() => {
    const onChange = (e: Event) => (e as CustomEvent).detail === id && setState(read(id))
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [id])
  const update = useCallback((patch: GuideProgressPatch) => {
    const next = guideProgress.update(id, patch)
    setState(next)
  }, [id])
  return [state, update] as const
}
