/**
 * Hotspot alert preferences. In this prototype nothing tracks location in the
 * background; alerts only appear through the "Simulate hotspot entry" action.
 */
const KEY = 'pasada-ligtas:alerts:v1'

export interface AlertPreferences {
  notifyOnHotspotEntry: boolean
}

export function loadAlertPreferences(): AlertPreferences {
  try {
    return { notifyOnHotspotEntry: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { notifyOnHotspotEntry: false }
  }
}

export function saveAlertPreferences(p: AlertPreferences) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export const HOTSPOT_MESSAGE =
  'You are near an area with reported animal-bite incidents. Stay aware of your surroundings.'
