import { BellRing, CalendarClock, CalendarX2, FileSearch, HeartHandshake, MapPin, PencilLine } from 'lucide-react'
import { UserConfirmedBadge } from '@/components/common/ui'
import { daysFromToday, formatDate, relativeDay } from '@/utils/format'
import type { FollowUp } from '@/types/index'
import type { ReminderPref } from '@/service/guideProgress'
import { KindLabel } from '@/features/documents/guide/GuideBlocks'
import { STRINGS } from '@/features/documents/guide/strings'
import type { Lang } from '@/features/documents/guide/types'

const formatTime = (hhmm: string, lang: Lang) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(lang === 'fil' ? 'fil-PH' : 'en-PH', { hour: 'numeric', minute: '2-digit' })
}

const btn = 'btn min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3'

export function AppointmentCard({
  appt,
  lang,
  reminder,
  onViewSource,
  onEdit,
  onReminder,
  onFindCare,
}: {
  appt: FollowUp | null
  lang: Lang
  reminder: ReminderPref | null
  onViewSource: () => void
  onEdit: () => void
  onReminder: () => void
  onFindCare: () => void
}) {
  const t = STRINGS[lang]
  if (!appt)
    return (
      <div className="rounded-3xl bg-caution/50 p-5 ring-1 ring-caution-ink/15">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-caution-ink">
            <CalendarX2 className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <KindLabel kind="needs_confirmation" lang={lang} />
            <p className="mt-2 font-semibold leading-snug text-ink">{t.noAppt}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onEdit} className={`${btn} border-mist bg-white text-navy`}>
            <PencilLine className="size-4" aria-hidden /> {t.editDetails}
          </button>
          <button type="button" onClick={onFindCare} className={`${btn} btn-primary`}>
            <HeartHandshake className="size-4" aria-hidden /> {t.findCare}
          </button>
        </div>
      </div>
    )

  const diff = daysFromToday(appt.date)
  const passed = diff < 0
  const reminderValid = reminder && reminder.appointmentDate === appt.date
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-royal p-5 text-white shadow-card on-dark">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-white/85">{t.nextAppt}</p>
        <UserConfirmedBadge />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15">
          <CalendarClock className="size-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-tight">{formatDate(appt.date, 'long', lang)}</p>
          <p className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-sm font-bold ${passed ? 'bg-caution text-caution-ink' : 'bg-white text-navy'}`}>
            {relativeDay(appt.date, lang)}
          </p>
        </div>
      </div>
      {appt.facilityName && (
        <p className="mt-3 flex items-start gap-2 text-sm text-white/90">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {appt.facilityName}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-white/85">{passed ? t.apptPassed : t.apptNote(appt.rowLabel)}</p>
      {reminderValid && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-white/12 px-3 py-2 text-sm font-semibold">
          <BellRing className="size-4 shrink-0" aria-hidden />
          {t.reminderSaved(formatDate(reminder.remindOn, 'short', lang), formatTime(reminder.time, lang))} · {t.calendarOnly}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onViewSource} className={`${btn} border-white/40 bg-white/10 text-white hover:bg-white/20`}>
          <FileSearch className="size-4" aria-hidden /> {t.viewSource}
        </button>
        <button type="button" onClick={onEdit} className={`${btn} border-white/40 bg-white/10 text-white hover:bg-white/20`}>
          <PencilLine className="size-4" aria-hidden /> {t.editDetails}
        </button>
        {!passed && (
          <button type="button" onClick={onReminder} className={`${btn} border-white bg-white text-navy hover:bg-pale`}>
            <BellRing className="size-4" aria-hidden /> {reminderValid ? t.editReminder : t.setReminder}
          </button>
        )}
        <button type="button" onClick={onFindCare} className={`${btn} border-white bg-white text-navy hover:bg-pale ${passed ? 'col-span-2' : ''}`}>
          <HeartHandshake className="size-4" aria-hidden /> {t.findCare}
        </button>
      </div>
    </div>
  )
}
