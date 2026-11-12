import { CalendarCheck, ChevronRight, FileText, Paperclip, Pencil, Plus, Stethoscope, Wallet } from 'lucide-react'
import { AnimalIcon } from '@/components/common/AnimalIcon'
import { EmptyRecordsIllustration } from '@/components/common/Illustrations'
import { Screen } from '@/components/layout/Screen'
import { Card, EmptyState, InfoRow, SectionHeading, UserConfirmedBadge } from '@/components/common/ui'
import { animalText, bodyAreaText, docTypeLabels, formatAmount, formatDate, hasPayment, relativeDay, todayISO } from '@/utils/format'
import { href } from '@/utils/router'
import type { FollowUp, StoredDocument, Visit } from '@/types/index'
import { useIncidentData } from '@/utils/useRecords'
import { NotFound } from '@/pages/NotFound'

type TimelineItem = { kind: 'visit'; date: string; visit: Visit } | { kind: 'followUp'; date: string; followUp: FollowUp }

export function IncidentDetail({ incidentId }: { incidentId: string }) {
  const { incident, visits, documents, followUps } = useIncidentData(incidentId)
  if (!incident) return <NotFound title="Incident not found" />

  const docById = new Map(documents.map((d) => [d.id, d]))
  const today = todayISO()
  const upcoming = followUps.filter((f) => f.date >= today)
  const recordedCategories = documents
    .map((d) => ({ doc: d, value: d.reviewed.incident.category.value }))
    .filter((x): x is { doc: StoredDocument; value: string } => !!x.value)

  const timeline: TimelineItem[] = [
    ...visits.map((v) => ({ kind: 'visit' as const, date: v.date, visit: v })),
    ...followUps.map((f) => ({ kind: 'followUp' as const, date: f.date, followUp: f })),
  ].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'visit' ? -1 : 1))

  return (
    <Screen
      title={`${animalText(incident)} · ${formatDate(incident.exposureDate)}`}
      eyebrow="Incident"
      back="records"
      backLabel="Back to records"
    >
      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
              <AnimalIcon type={incident.animalType} className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-navy">Incident details</h2>
              <UserConfirmedBadge className="mt-1" />
            </div>
          </div>
          <dl className="mt-3 divide-y divide-mist">
            <InfoRow label="Date of incident/exposure" value={formatDate(incident.exposureDate)} />
            <InfoRow label="Location of incident" value={incident.location} />
            <InfoRow label="Animal type" value={animalText(incident)} />
            <InfoRow label="Affected body area" value={bodyAreaText(incident)} />
            <InfoRow label="Patient-reported notes" value={incident.notes} />
          </dl>
          {recordedCategories.length > 0 && (
            <div className="mt-3 rounded-2xl bg-canvas p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/70">Document information</p>
              {recordedCategories.map(({ doc, value }) => (
                <p key={doc.id} className="mt-1 text-sm text-ink">
                  Exposure category recorded on {docTypeLabels[doc.type].toLowerCase()}: <strong>Category {value}</strong>
                </p>
              ))}
            </div>
          )}
          <a
            href={href(`incidents/${incident.id}/edit`)}
            className="btn mt-4 min-h-11 w-full rounded-full border-mist bg-white text-navy sm:w-auto"
          >
            <Pencil className="size-4" aria-hidden /> Edit incident
          </a>
        </Card>

        {upcoming.length > 0 && (
          <Card className="border-l-4 border-royal p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-navy">
              <CalendarCheck className="size-5 text-royal" aria-hidden /> Next clinic-written follow-up
            </p>
            <p className="mt-2 text-xl font-extrabold text-ink">{formatDate(upcoming[0].date, 'long')}</p>
            <p className="text-sm text-ink/70">
              {relativeDay(upcoming[0].date)} · {upcoming[0].facilityName ?? 'Facility not recorded'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <UserConfirmedBadge />
              <span className="text-xs text-ink/70">From a date the clinic wrote on your document</span>
            </div>
          </Card>
        )}

        <section aria-labelledby="tracker-heading">
          <SectionHeading id="tracker-heading" title="Bite tracker" description="Hospital visits for this incident, oldest first." />
          <div className="mb-4 grid grid-cols-2 gap-2">
            <a href={href(`incidents/${incident.id}/visits/new`)} className="btn btn-primary min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
              <Plus className="size-5" aria-hidden /> Add hospital visit
            </a>
            <a href={href(`scan?incident=${incident.id}`)} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
              <Paperclip className="size-5" aria-hidden /> Attach document
            </a>
          </div>

          {timeline.length === 0 ? (
            <Card>
              <EmptyState
                illustration={<EmptyRecordsIllustration className="w-40" />}
                title="No hospital visits yet"
                body="Add a visit after you go to a facility, or attach a treatment card to add the dated rows you confirm."
              />
            </Card>
          ) : (
            <ol className="relative ml-3 border-l-2 border-dashed border-mist pl-6">
              {timeline.map((item) =>
                item.kind === 'visit' ? (
                  <VisitItem key={item.visit.id} visit={item.visit} incidentId={incident.id} docs={item.visit.documentIds.map((id) => docById.get(id)).filter(Boolean) as StoredDocument[]} />
                ) : (
                  <FollowUpItem key={item.followUp.id} followUp={item.followUp} />
                ),
              )}
            </ol>
          )}
        </section>

        <section aria-labelledby="docs-heading">
          <SectionHeading id="docs-heading" title="Attached documents" />
          {documents.length === 0 ? (
            <p className="rounded-3xl bg-white p-5 text-sm text-ink/70 shadow-card">No documents attached yet.</p>
          ) : (
            <ul className="grid gap-2">
              {documents.map((d) => (
                <li key={d.id}>
                  <DocLink doc={d} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Screen>
  )
}

function DocLink({ doc, compact = false }: { doc: StoredDocument; compact?: boolean }) {
  if (compact) {
    return (
      <a href={href(`documents/${doc.id}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-pale px-3 text-xs font-semibold text-navy hover:bg-mist">
        <FileText className="size-3.5" aria-hidden /> {docTypeLabels[doc.type]}
      </a>
    )
  }
  return (
    <a href={href(`documents/${doc.id}`)} className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card hover:ring-2 hover:ring-cornflower">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
        <FileText className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{docTypeLabels[doc.type]}</span>
        <span className="block truncate text-xs text-ink/70">
          Document date {formatDate(doc.reviewed.facility.documentDate.value)} · {doc.reviewed.facility.name.value ?? 'Facility not recorded'}
        </span>
      </span>
      <ChevronRight className="size-5 text-royal" aria-hidden />
    </a>
  )
}

function VisitItem({ visit, incidentId, docs }: { visit: Visit; incidentId: string; docs: StoredDocument[] }) {
  return (
    <li className="relative mb-4 last:mb-0">
      <span className="absolute -left-[37px] top-4 grid size-6 place-items-center rounded-full bg-royal ring-4 ring-canvas" aria-hidden>
        <Stethoscope className="size-3.5 text-white" />
      </span>
      <div className="rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{formatDate(visit.date)}</span>
              {visit.rowLabel && (
                <span className="rounded-lg bg-pale px-2 py-0.5 text-xs font-bold text-navy" title="Row label printed on the document">
                  {visit.rowLabel}
                </span>
              )}
            </p>
            <p className="text-sm text-ink/70">{visit.facilityName ?? 'Facility not recorded'}</p>
          </div>
          <a
            href={href(`incidents/${incidentId}/visits/${visit.id}/edit`)}
            className="btn btn-ghost btn-sm min-h-11 rounded-full text-royal"
            aria-label={`Edit visit on ${formatDate(visit.date)}`}
          >
            <Pencil className="size-4" aria-hidden /> Edit visit
          </a>
        </div>
        {visit.treatmentAsRecorded && (
          <p className="mt-2 text-sm text-ink">
            <span className="text-ink/70">As recorded: </span>
            {visit.treatmentAsRecorded}
          </p>
        )}
        {visit.notes && (
          <p className="mt-1.5 text-sm text-ink">
            <span className="text-ink/70">Your notes: </span>
            {visit.notes}
          </p>
        )}
        {hasPayment(visit.payment) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink">
            <Wallet className="size-4 text-royal" aria-hidden />
            <span>Paid {formatAmount(visit.payment.amount)}</span>
            {visit.payment.receiptNumber && <span className="text-ink/70">Receipt {visit.payment.receiptNumber}</span>}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <UserConfirmedBadge />
          {docs.map((d) => (
            <DocLink key={d.id} doc={d} compact />
          ))}
        </div>
      </div>
    </li>
  )
}

function FollowUpItem({ followUp }: { followUp: FollowUp }) {
  const past = followUp.date < todayISO()
  return (
    <li className="relative mb-4 last:mb-0">
      <span className="absolute -left-[37px] top-4 grid size-6 place-items-center rounded-full border-2 border-dashed border-royal bg-white ring-4 ring-canvas" aria-hidden>
        <CalendarCheck className="size-3 text-royal" />
      </span>
      <div className="rounded-3xl border-2 border-dashed border-mist bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-royal">Clinic-written follow-up</p>
        <p className="mt-1 flex flex-wrap items-center gap-2 font-bold text-ink">
          {formatDate(followUp.date)}
          {followUp.rowLabel && <span className="rounded-lg bg-pale px-2 py-0.5 text-xs font-bold text-navy">{followUp.rowLabel}</span>}
          <span className="text-sm font-medium text-ink/70">· {past ? 'Date has passed' : relativeDay(followUp.date)}</span>
        </p>
        <p className="text-sm text-ink/70">{followUp.facilityName ?? 'Facility not recorded'}</p>
        {followUp.note && <p className="mt-1 text-sm text-ink">{followUp.note}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <UserConfirmedBadge />
          <a href={href(`documents/${followUp.documentId}`)} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-royal hover:underline">
            View source document <ChevronRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </li>
  )
}
