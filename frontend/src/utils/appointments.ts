import { daysFromToday } from '@/utils/format'
import type { FollowUp } from '@/types/index'

/** The next user-confirmed, clinic-written appointment. Past dates are never treated as upcoming. */
export function pickAppointment(followUps: FollowUp[]) {
  const sorted = [...followUps].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.find((f) => daysFromToday(f.date) >= 0) ?? sorted[sorted.length - 1] ?? null
}
