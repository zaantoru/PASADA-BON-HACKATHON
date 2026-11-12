import { createContext } from 'react'
import type { AlertPreferences } from '@/service/alertService'

export interface ActiveAlert {
  areaName: string
  city: string
}

interface AlertApi {
  prefs: AlertPreferences
  setNotifyOnHotspotEntry: (on: boolean) => void
  simulateEntry: (area: ActiveAlert) => void
}

export const AlertContext = createContext<AlertApi | null>(null)
