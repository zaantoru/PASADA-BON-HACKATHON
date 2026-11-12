import { BellOff, BellRing, CalendarPlus, CircleCheck } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { BottomSheet } from '@/components/common/BottomSheet'
import { inputClass } from '@/components/common/form'
import { DemoBadge, Notice } from '@/components/common/ui'
import { formatDate, todayISO } from '@/utils/format'
import type { ReminderPref } from '@/service/guideProgress'
import {
  buildIcs,
  defaultRemindOn,
  downloadIcs,
  NOTIFICATION_BODY,
  notificationState,
  requestNotificationPermission,
  scheduleReminder,
  sendTestNotification,
  type NotificationState,
} from '@/service/reminderService'
import { useToast } from '@/utils/useToast'

function ReminderSheetContent({
  open,
  onClose,
  appointmentDate,
  facilityName,
  existing,
  onSave,
}: {
  open: boolean
  onClose: () => void
  appointmentDate: string
  facilityName: string | null
  existing: ReminderPref | null
  onSave: (r: ReminderPref) => void
}) {
  const toast = useToast()
  const today = todayISO()
  const initialDay = () => {
    const d = existing?.appointmentDate === appointmentDate ? existing.remindOn : defaultRemindOn(appointmentDate)
    return d < today ? today : d
  }
  const [remindOn, setRemindOn] = useState(initialDay)
  const [time, setTime] = useState(existing?.time ?? '08:00')
  const [notify, setNotify] = useState(existing?.browserNotifications ?? false)
  const [perm, setPerm] = useState<NotificationState>(notificationState)
  const [icsDone, setIcsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)



  const toggleNotify = async (on: boolean) => {
    setNotify(on)
    // Permission is requested only after the user explicitly turns this on.
    if (on && perm === 'default') setPerm(await requestNotificationPermission())
  }

  const valid = remindOn >= today && remindOn <= appointmentDate && /^\d{2}:\d{2}$/.test(time)

  const save = async () => {
    if (!valid) return setError('Choose a reminder date between today and the appointment date.')
    const res = await scheduleReminder()
    onSave({ appointmentDate, remindOn, time, browserNotifications: notify && perm === 'granted', savedAt: new Date().toISOString() })
    toast(res.status === 'scheduled' ? 'Reminder scheduled.' : 'Reminder preference saved. Add it to your calendar to get an alert.')
    onClose()
  }

  const exportIcs = () => {
    if (!valid) return setError('Choose a reminder date between today and the appointment date.')
    downloadIcs(buildIcs({ appointmentDate, remindOn, time, location: facilityName }))
    setIcsDone(true)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow={<DemoBadge>Demo reminder</DemoBadge>}
      title="Set a reminder"
      footer={
        <div className="grid gap-2">
          <button type="button" onClick={save} className="btn btn-primary min-h-12 rounded-full">
            Save reminder preference
          </button>
          <button type="button" onClick={exportIcs} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
            <CalendarPlus className="size-4" aria-hidden /> Add to calendar (.ics)
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-pale p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-navy">Confirmed appointment date</p>
          <p className="mt-1 text-lg font-bold text-ink">{formatDate(appointmentDate, 'long')}</p>
          <p className="text-xs text-ink/70">From your card · User-confirmed</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rem-date" className="mb-1.5 block text-sm font-bold text-ink">
              Remind me on
            </label>
            <input id="rem-date" type="date" className={inputClass} value={remindOn} min={today} max={appointmentDate} onChange={(e) => setRemindOn(e.target.value)} aria-invalid={!valid} />
          </div>
          <div>
            <label htmlFor="rem-time" className="mb-1.5 block text-sm font-bold text-ink">
              At
            </label>
            <input id="rem-time" type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        {error && !valid && (
          <Notice tone="error" title="Check the reminder date">
            {error}
          </Notice>
        )}

        <fieldset className="rounded-2xl border border-mist p-4">
          <legend className="px-1 text-sm font-bold text-ink">Browser notifications</legend>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-ink">Allow PASADA to show notifications on this browser</span>
            <input type="checkbox" className="toggle toggle-primary" checked={notify} onChange={(e) => toggleNotify(e.target.checked)} disabled={perm === 'unsupported'} />
          </label>
          <p className="mt-1 text-xs leading-relaxed text-ink/70">Notifications will only say: “{NOTIFICATION_BODY}” No medical details are shown.</p>
          {perm === 'unsupported' && (
            <Notice tone="caution" icon={BellOff} className="mt-3" title="Notifications aren’t supported here">
              This browser can’t show notifications. Use the calendar file instead.
            </Notice>
          )}
          {notify && perm === 'denied' && (
            <Notice tone="caution" icon={BellOff} className="mt-3" title="Notifications are blocked">
              You can allow them in your browser’s site settings, or use the calendar file instead.
            </Notice>
          )}
          {notify && perm === 'granted' && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-800">
              <CircleCheck className="size-4" aria-hidden /> Notifications are allowed.
              <button type="button" className="btn btn-ghost btn-sm min-h-10 rounded-full text-royal" onClick={() => sendTestNotification() || toast('Couldn’t show a test notification.')}>
                <BellRing className="size-4" aria-hidden /> Send a test
              </button>
            </div>
          )}
        </fieldset>

        <Notice tone="info" title="Not scheduled automatically">
          This prototype can’t send a reminder while the app is closed. It saves your preference on this device. To get an alert, add the date to your calendar.
        </Notice>
        {icsDone && (
          <Notice tone="success" title="Calendar file downloaded">
            Open the downloaded file to add it to your calendar app. The reminder isn’t set until you do.
          </Notice>
        )}
      </div>
    </BottomSheet>
  )
}

export function ReminderSheet(props: ComponentProps<typeof ReminderSheetContent>) {
  return props.open ? <ReminderSheetContent key={props.appointmentDate} {...props} /> : null
}
