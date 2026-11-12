import { ArrowRight, CalendarCheck, ChevronRight, Hospital, MapPinned, PencilLine, ScanLine, Stethoscope } from 'lucide-react'
import { AnimalIcon } from '@/components/common/AnimalIcon'
import { BrandMark } from '@/components/common/BrandMark'
import { WelcomeIllustration } from '@/components/common/Illustrations'
import { Card, SectionHeading, UserConfirmedBadge } from '@/components/common/ui'
import { animalText, bodyAreaText, formatDate, relativeDay, todayISO } from '@/utils/format'
import { href } from '@/utils/router'
import { useRecords } from '@/utils/useRecords'
import { useEffect, useRef } from 'react'

export function Home() {
  const { incidents, visits, followUps } = useRecords()
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    h1.current?.focus({ preventScroll: true })
  }, [])

  const recentIncident = [...incidents].sort((a, b) =>
    (b.exposureDate ?? b.createdAt).localeCompare(a.exposureDate ?? a.createdAt),
  )[0]
  const today = todayISO()
  const latestVisit = [...visits].filter((v) => v.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0]
  const nextFollowUp = [...followUps].filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0]
  const isNew = incidents.length === 0

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-dark relative overflow-hidden bg-gradient-to-br from-navy via-navy to-royal px-4 pb-24 pt-5 text-white sm:px-6">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cornflower/25" />
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 size-40 rounded-full bg-royal/40" />
        <div className="relative mx-auto flex max-w-2xl items-center gap-3">
          <BrandMark className="size-11 shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight tracking-tight">PASADA: LIGTAS</p>
            <p className="truncate text-xs text-white/80">Personal Assistant for Smart Action on Documents &amp; Affairs</p>
          </div>
        </div>
        <div className="relative mx-auto mt-7 flex max-w-2xl items-end gap-3">
          <div className="min-w-0 flex-1">
            <h1 ref={h1} tabIndex={-1} className="text-[26px] font-extrabold leading-tight sm:text-3xl">
              Malinaw na dokumento.
              <span className="block text-cornflower">Gabay sa susunod na hakbang.</span>
            </h1>
            <p className="mt-2 max-w-sm text-sm text-white/85">
              Record animal-bite incidents, review your treatment documents, and keep track of hospital visits.
            </p>
          </div>
          {isNew && <WelcomeIllustration className="hidden w-48 shrink-0 sm:block" />}
        </div>
      </header>

      <main className="relative -mt-16 flex-1 px-4 pb-32 sm:px-6 lg:pb-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
                <ScanLine className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy">Start from your document</h2>
                <p className="mt-0.5 text-sm text-ink/70">
                  Scan a vaccination/treatment card to prefill your record. You check every detail before saving.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <a href={href('scan?type=treatment_card')} className="btn btn-primary min-h-14 rounded-2xl text-base shadow-[0_8px_20px_-8px_rgb(43_106_208/0.7)]">
                <ScanLine className="size-5" aria-hidden />
                Scan treatment card
              </a>
              <a href={href('incidents/new')} className="btn min-h-14 rounded-2xl border-mist bg-pale text-base text-navy hover:border-cornflower hover:bg-mist">
                <PencilLine className="size-5" aria-hidden />
                Record incident manually
              </a>
            </div>
          </Card>

          {isNew ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col items-center px-5 pb-6 pt-5 text-center">
                <WelcomeIllustration className="w-56 sm:hidden" />
                <h2 className="mt-2 text-lg font-bold text-navy">Your records start here</h2>
                <p className="mt-1 max-w-sm text-sm text-ink/70">
                  Nothing saved yet. Here's how PASADA: LIGTAS helps after an animal bite or scratch:
                </p>
                <ol className="mt-5 grid w-full gap-3 text-left sm:grid-cols-3">
                  {[
                    ['Record the incident', 'When, where, which animal, and where on your body.'],
                    ['Review your documents', 'Check details read from your card before saving.'],
                    ['Track hospital visits', 'Keep every visit and document in one timeline.'],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-3 rounded-2xl bg-canvas p-3.5 sm:flex-col">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-royal text-sm font-bold text-white">{i + 1}</span>
                      <span>
                        <span className="block text-sm font-bold text-ink">{t}</span>
                        <span className="block text-xs text-ink/70">{d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          ) : (
            <section aria-labelledby="summary-heading">
              <SectionHeading
                id="summary-heading"
                title="Your latest records"
                action={
                  <a href={href('records')} className="flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-royal hover:underline">
                    All records <ChevronRight className="size-4" aria-hidden />
                  </a>
                }
              />
              <div className="grid gap-3">
                {recentIncident && (
                  <a href={href(`incidents/${recentIncident.id}`)} className="block rounded-3xl bg-white p-4 shadow-card transition hover:ring-2 hover:ring-cornflower">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/70">Recent incident</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
                        <AnimalIcon type={recentIncident.animalType} className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink">
                          {animalText(recentIncident)} · {formatDate(recentIncident.exposureDate)}
                        </p>
                        <p className="truncate text-sm text-ink/70">
                          {recentIncident.location ?? 'Location not recorded'} · {bodyAreaText(recentIncident)}
                        </p>
                      </div>
                      <ArrowRight className="size-5 shrink-0 text-royal" aria-hidden />
                    </div>
                  </a>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-4 shadow-card">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/70">
                      <Stethoscope className="size-4 text-royal" aria-hidden /> Most recent visit
                    </p>
                    {latestVisit ? (
                      <a href={href(`incidents/${latestVisit.incidentId}`)} className="mt-2 block rounded-xl hover:underline">
                        <p className="font-bold text-ink">{formatDate(latestVisit.date)}</p>
                        <p className="text-sm text-ink/70">{latestVisit.facilityName ?? 'Facility not recorded'}</p>
                        {latestVisit.rowLabel && <p className="mt-1 text-xs text-ink/70">Row on card: {latestVisit.rowLabel}</p>}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-ink/70">No hospital visits recorded yet.</p>
                    )}
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-card">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/70">
                      <CalendarCheck className="size-4 text-royal" aria-hidden /> Next clinic appointment
                    </p>
                    {nextFollowUp ? (
                      <a href={href(`incidents/${nextFollowUp.incidentId}`)} className="mt-2 block rounded-xl hover:underline">
                        <p className="font-bold text-ink">
                          {formatDate(nextFollowUp.date)} <span className="font-medium text-royal">· {relativeDay(nextFollowUp.date)}</span>
                        </p>
                        <p className="text-sm text-ink/70">{nextFollowUp.facilityName ?? 'Facility not recorded'}</p>
                        <UserConfirmedBadge className="mt-2" />
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-ink/70">
                        None confirmed. Appointments appear here only after you confirm a date the clinic wrote.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="care-heading">
            <SectionHeading id="care-heading" title="Find care and stay aware" />
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={href('hospitals')} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition hover:ring-2 hover:ring-cornflower">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-royal text-white">
                  <Hospital className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">Search hospitals</span>
                  <span className="block text-sm text-ink/70">Public and private animal-bite care</span>
                </span>
                <ChevronRight className="size-5 text-royal" aria-hidden />
              </a>
              <a href={href('hotspots')} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition hover:ring-2 hover:ring-cornflower">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-navy">
                  <MapPinned className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">Bite hotspots</span>
                  <span className="block text-sm text-ink/70">Areas with reported bite incidents</span>
                </span>
                <ChevronRight className="size-5 text-royal" aria-hidden />
              </a>
            </div>
          </section>

          <p className="px-1 text-xs leading-relaxed text-ink/70">
            PASADA: LIGTAS organizes your records. It does not diagnose, assign exposure categories, or set
            vaccination schedules. Follow the instructions from your health facility.
          </p>
        </div>
      </main>
    </div>
  )
}
