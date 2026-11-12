import { addDays } from '@/utils/format'

export type NotificationState = 'unsupported' | 'default' | 'granted' | 'denied'

/** Privacy-conscious wording: no medical details appear on the lock screen. */
export const NOTIFICATION_TITLE = 'PASADA: LIGTAS'
export const NOTIFICATION_BODY = 'You have an upcoming reminder. Open the app for details.'

export function notificationState(): NotificationState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as NotificationState
}

/** Only call after the user explicitly turns notifications on. */
export async function requestNotificationPermission(): Promise<NotificationState> {
  if (notificationState() === 'unsupported') return 'unsupported'
  try {
    return (await Notification.requestPermission()) as NotificationState
  } catch {
    return notificationState()
  }
}

export function sendTestNotification() {
  if (notificationState() !== 'granted') return false
  try {
    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY, tag: 'pasada-test' })
    return true
  } catch {
    return false
  }
}

export interface ScheduleResult {
  /** 'scheduled' is returned only by a real scheduler. The demo never claims it. */
  status: 'scheduled' | 'saved_without_scheduler'
}

/**
 * Demo adapter. Browsers can't deliver a notification at a future time while the app is closed,
 * so this saves the preference only. Replace with a push/scheduler backend and return 'scheduled'
 * only when that backend confirms.
 */
export async function scheduleReminder(): Promise<ScheduleResult> {
  return { status: 'saved_without_scheduler' }
}

export const defaultRemindOn = (appointment: string) => addDays(appointment, -1)

const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n')
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** iCalendar file: an all-day event on the appointment date with an alarm at the chosen time (Manila, UTC+8). */
export function buildIcs({ appointmentDate, remindOn, time, location }: { appointmentDate: string; remindOn: string; time: string; location: string | null }) {
  const day = appointmentDate.replace(/-/g, '')
  const next = addDays(appointmentDate, 1).replace(/-/g, '')
  const [h, m] = time.split(':').map(Number)
  const [ry, rm, rd] = remindOn.split('-').map(Number)
  // Manila has no daylight saving time, so local = UTC + 8 all year.
  const alarmUtc = new Date(Date.UTC(ry, rm - 1, rd, h - 8, m))
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PASADA LIGTAS//Reminder//EN',
    'BEGIN:VEVENT',
    `UID:${day}-${Math.random().toString(36).slice(2)}@pasada-ligtas`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    'SUMMARY:Treatment center visit',
    `DESCRIPTION:${esc('Date written on your treatment card. Bring your card. Confirm the time with your treatment center.')}`,
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Upcoming visit reminder',
    `TRIGGER;VALUE=DATE-TIME:${stamp(alarmUtc)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadIcs(ics: string, fileName = 'pasada-appointment.ics') {
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
