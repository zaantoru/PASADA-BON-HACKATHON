import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { Screen } from '@/components/layout/Screen'
import { Card, DemoBadge, InfoRow, UserConfirmedBadge } from '@/components/common/ui'
import { animalLabels, docTypeLabels, entryTypeLabels, formatAmount, formatDate } from '@/utils/format'
import type { AnimalType, RecordedValue, StoredDocument } from '@/types/index'
import { panelSectionId } from '@/features/documents/review/panel'
import { previewCache } from '@/service/documentService'
import { useRecords } from '@/utils/useRecords'
import { NotFound } from '@/pages/NotFound'

const savedAsLabels = { visit: 'Added as hospital visit', follow_up: 'Added as clinic-written follow-up', document_only: 'Kept with document only' }

function Row({ label, rv, date = false, format }: { label: string; rv: RecordedValue; date?: boolean; format?: (v: string) => string }) {
  const value = rv.value ? (date ? formatDate(rv.value) : format ? format(rv.value) : rv.value) : null
  return <InfoRow label={label} value={value} raw={rv.raw} />
}

/** Read-only reviewed details, grouped like the review form. Used in the guide's document-details panel. */
export function DocumentDetailsContent({ doc }: { doc: StoredDocument }) {
  const r = doc.reviewed
  return (
    <div className="flex flex-col gap-4">
      <Card className="scroll-mt-24 p-5">
        <div id={panelSectionId('people')} className="scroll-mt-24" />
        <h3 className="text-base font-bold text-navy">Patient and incident</h3>
        <dl className="mt-1 divide-y divide-mist">
          <Row label="Name" rv={r.patient.name} />
          <Row label="Birthday" rv={r.patient.birthday} date />
          <Row label="Card or registration no." rv={r.patient.idNumber} />
          <Row label="Patient address" rv={r.patient.address} />
          <Row label="Exposure date" rv={r.incident.exposureDate} date />
          <Row label="Animal type" rv={r.incident.animalType} format={(v) => animalLabels[v as AnimalType] ?? v} />
          <Row label="Affected body area" rv={r.incident.bodyArea} />
          <Row label="Place of exposure" rv={r.incident.place} />
          <Row label="Exposure category recorded" rv={r.incident.category} format={(v) => `Category ${v}`} />
        </dl>
      </Card>
      <Card className="p-5">
        <div id={panelSectionId('facility')} className="scroll-mt-24" />
        <h3 className="text-base font-bold text-navy">Facility and document</h3>
        <dl className="mt-1 divide-y divide-mist">
          <Row label="Facility name" rv={r.facility.name} />
          <InfoRow label="Document type" value={docTypeLabels[doc.type]} />
          <Row label="Document date" rv={r.facility.documentDate} date />
          <Row label="Form revision" rv={r.facility.formRevision} />
        </dl>
      </Card>
      <Card className="p-5">
        <div id={panelSectionId('visits')} className="scroll-mt-24" />
        <h3 className="text-base font-bold text-navy">Recorded visits and follow-ups</h3>
        {r.entries.length === 0 ? (
          <p className="mt-2 text-sm italic text-ink/70">No visit entries on this document.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {r.entries.map((e, i) => (
              <li key={i} className="rounded-2xl bg-canvas p-3.5 text-sm">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-navy ring-1 ring-mist">{e.rowLabel.value ?? 'Entry'}</span>
                  <span className="font-semibold text-ink">{e.dateWritten.value ? formatDate(e.dateWritten.value) : <span className="font-normal italic text-ink/70">Not recorded</span>}</span>
                  <span className="text-xs text-ink/70">· {entryTypeLabels[e.entryType]}</span>
                </p>
                {e.description.value && <p className="mt-1 text-ink">{e.description.value}</p>}
                {[e.dateWritten, e.description].map((f, j) =>
                  f.raw && f.raw !== f.value ? (
                    <p key={j} className="mt-0.5 text-xs text-ink/70">
                      On document: “{f.raw}”
                    </p>
                  ) : null,
                )}
                <p className="mt-1 text-xs font-semibold text-royal">{savedAsLabels[e.savedAs]}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <div id={panelSectionId('payment')} className="scroll-mt-24" />
        <h3 className="text-base font-bold text-navy">Payment</h3>
        {r.payment ? (
          <dl className="mt-1 divide-y divide-mist">
            <InfoRow label="Amount paid" value={r.payment.amount.value ? formatAmount(r.payment.amount.value) : null} raw={r.payment.amount.raw} />
            <Row label="Receipt number" rv={r.payment.receiptNumber} />
            <Row label="Payment date" rv={r.payment.paymentDate} date />
          </dl>
        ) : (
          <p className="mt-2 text-sm italic text-ink/70">No payment on this document.</p>
        )}
      </Card>
    </div>
  )
}

export function DocumentDetail({ documentId }: { documentId: string }) {
  const { documents } = useRecords()
  const doc = documents.find((d) => d.id === documentId)
  if (!doc) return <NotFound title="Document not found" />
  const r = doc.reviewed
  const url = doc.previewUrl ?? previewCache.get(doc.id)

  return (
    <Screen width="lg" title={docTypeLabels[doc.type]} eyebrow="Document" back={`incidents/${doc.incidentId}`} backLabel="Back to incident">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink/70">
        <UserConfirmedBadge />
        <span>Reviewed and saved {formatDate(doc.savedAt.slice(0, 10))}</span>
        {doc.isDemoExtraction && <DemoBadge>Demo extraction</DemoBadge>}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <Card className="p-3 lg:sticky lg:top-4">
          <p className="px-2 pb-2 pt-1 text-sm font-bold text-navy">Original</p>
          <DocumentPreview url={url} mimeType={doc.mimeType} fileName={doc.fileName} className="max-h-[70dvh]" />
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-navy">Patient</h2>
            <dl className="mt-2 divide-y divide-mist">
              <Row label="Name" rv={r.patient.name} />
              <Row label="Birthday" rv={r.patient.birthday} date />
              <Row label="Card or registration no." rv={r.patient.idNumber} />
              <Row label="Patient address" rv={r.patient.address} />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold text-navy">Incident (as on document)</h2>
            <dl className="mt-2 divide-y divide-mist">
              <Row label="Exposure date" rv={r.incident.exposureDate} date />
              <Row label="Animal type" rv={r.incident.animalType} format={(v) => animalLabels[v as AnimalType] ?? v} />
              <Row label="Affected body area" rv={r.incident.bodyArea} />
              <Row label="Place of exposure" rv={r.incident.place} />
              <Row label="Exposure category recorded" rv={r.incident.category} format={(v) => `Category ${v}`} />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold text-navy">Facility and document</h2>
            <dl className="mt-2 divide-y divide-mist">
              <Row label="Facility name" rv={r.facility.name} />
              <InfoRow label="Document type" value={docTypeLabels[doc.type]} />
              <Row label="Document date" rv={r.facility.documentDate} date />
              <Row label="Form revision" rv={r.facility.formRevision} />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-bold text-navy">Visit entries</h2>
            {r.entries.length === 0 ? (
              <p className="mt-2 text-sm italic text-ink/70">No visit entries on this document.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {r.entries.map((e, i) => (
                  <li key={i} className="rounded-2xl bg-canvas p-3.5 text-sm">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-navy ring-1 ring-mist">{e.rowLabel.value ?? 'Entry'}</span>
                      <span className="font-semibold text-ink">{e.dateWritten.value ? formatDate(e.dateWritten.value) : <span className="italic font-normal text-ink/70">Not recorded</span>}</span>
                      <span className="text-xs text-ink/70">· {entryTypeLabels[e.entryType]}</span>
                    </p>
                    {e.description.value && <p className="mt-1 text-ink">{e.description.value}</p>}
                    <p className="mt-1 text-xs font-semibold text-royal">{savedAsLabels[e.savedAs]}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {r.payment && (
            <Card className="p-5">
              <h2 className="text-lg font-bold text-navy">Payment</h2>
              <dl className="mt-2 divide-y divide-mist">
                <InfoRow label="Amount paid" value={r.payment.amount.value ? formatAmount(r.payment.amount.value) : null} raw={r.payment.amount.raw} />
                <Row label="Receipt number" rv={r.payment.receiptNumber} />
                <Row label="Payment date" rv={r.payment.paymentDate} date />
              </dl>
            </Card>
          )}
        </div>
      </div>
    </Screen>
  )
}
