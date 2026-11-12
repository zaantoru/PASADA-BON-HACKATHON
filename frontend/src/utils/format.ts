import type { AnimalType, DocType, EntryType, Incident, Payment } from '@/types/index'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
/** All "today" and relative-date calculations use the application's timezone. */
export const APP_TIMEZONE = 'Asia/Manila'

export function todayISO() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function daysFromToday(iso: string) {
  return Math.round((parseISO(iso).getTime() - parseISO(todayISO()).getTime()) / 86400000)
}

export function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number) {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const NOT_RECORDED = 'Not recorded'

export function formatDate(iso: string | null | undefined, style: 'short' | 'long' = 'short', lang: 'en' | 'fil' = 'en') {
  if (!iso) return lang === 'fil' ? 'Hindi nakatala' : NOT_RECORDED
  return parseISO(iso).toLocaleDateString(lang === 'fil' ? 'fil-PH' : 'en-PH', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    ...(style === 'long' ? { weekday: 'short' } : {}),
  })
}

export function relativeDay(iso: string, lang: 'en' | 'fil' = 'en') {
  const diff = daysFromToday(iso)
  if (lang === 'fil') {
    if (diff === 0) return 'Ngayong araw'
    if (diff === 1) return 'Bukas'
    if (diff === -1) return 'Kahapon'
    return diff > 0 ? `${diff} araw mula ngayon` : `${-diff} araw na ang nakalipas`
  }
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`
}

export const animalLabels: Record<AnimalType, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
  unknown: 'Unknown',
}

export function animalText(incident: Pick<Incident, 'animalType' | 'animalOther'>) {
  if (incident.animalType === 'other' && incident.animalOther) return incident.animalOther
  return animalLabels[incident.animalType]
}

export const docTypeLabels: Record<DocType, string> = {
  treatment_card: 'Vaccination/treatment card',
  instruction_sheet: 'Hospital instruction sheet',
  receipt: 'Receipt',
}

export const entryTypeLabels: Record<EntryType, string> = {
  recorded_visit: 'Recorded visit',
  scheduled_follow_up: 'Scheduled follow-up',
  observation: 'Observation note',
  unclear: 'Unclear',
}

export function bodyAreaText(incident: Pick<Incident, 'bodyAreas' | 'bodyAreaDetail'>) {
  const parts = [incident.bodyAreas.join(', '), incident.bodyAreaDetail].filter(Boolean)
  return parts.length ? parts.join(' — ') : NOT_RECORDED
}

export function formatAmount(amount: string | null | undefined) {
  if (amount === null || amount === undefined || amount.trim() === '') return NOT_RECORDED
  const trimmed = amount.trim()
  return /^₱|^PHP/i.test(trimmed) ? trimmed : `₱${trimmed}`
}

export function hasPayment(p: Payment | null | undefined): p is Payment {
  return !!p && (!!p.amount || !!p.receiptNumber || !!p.date)
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export const blankToNull = (v: string | null | undefined) => {
  const t = (v ?? '').trim()
  return t === '' ? null : t
}
