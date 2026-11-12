import { AlertContext, type ActiveAlert } from './alert-context'
import { BellRing, X } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { HOTSPOT_MESSAGE, loadAlertPreferences, saveAlertPreferences } from '@/service/alertService'

export function AlertProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(loadAlertPreferences)
  const [active, setActive] = useState<ActiveAlert | null>(null)

  const setNotifyOnHotspotEntry = useCallback((on: boolean) => {
    const next = { notifyOnHotspotEntry: on }
    saveAlertPreferences(next)
    setPrefs(next)
  }, [])
  const simulateEntry = useCallback((area: ActiveAlert) => setActive(area), [])

  return (
    <AlertContext.Provider value={{ prefs, setNotifyOnHotspotEntry, simulateEntry }}>
      {children}
      {active && (
        <div className="fixed inset-x-0 top-0 z-[1250] flex justify-center px-3 pt-3 lg:pl-[96px]">
          <div
            role="alert"
            className="flex w-full max-w-md animate-drop-in gap-3 rounded-3xl bg-white p-4 shadow-[0_18px_40px_-12px_rgb(6_30_71/0.45)] ring-1 ring-mist"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
              <BellRing className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/70">
                PASADA: LIGTAS
                <span className="rounded-full bg-caution px-2 py-0.5 text-[11px] font-bold text-caution-ink">
                  Simulated alert
                </span>
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-ink">{HOTSPOT_MESSAGE}</p>
              <p className="mt-1 text-xs text-ink/70">
                Near: {active.areaName}, {active.city}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="grid size-11 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-pale"
              aria-label="Dismiss alert"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  )
}
