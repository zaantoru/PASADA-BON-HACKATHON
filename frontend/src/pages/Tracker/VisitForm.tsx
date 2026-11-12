import { FileText, LoaderCircle, Paperclip, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Field, inputClass, textareaClass } from '@/components/common/form'
import { Screen } from '@/components/layout/Screen'
import { Card, Notice } from '@/components/common/ui'
import { animalText, blankToNull, docTypeLabels, formatDate, todayISO } from '@/utils/format'
import { href, navigate } from '@/utils/router'
import type { VisitInput } from '@/types/index'
import { facilityNames } from '@/service/facilityService'
import { useIncidentData, useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'
import { NotFound } from '@/pages/NotFound'

export function VisitForm({ incidentId, visitId }: { incidentId: string; visitId?: string }) {
  const { incident, documents } = useIncidentData(incidentId)
  const { visits, createVisit, updateVisit } = useRecords()
  const toast = useToast()
  const visit = visitId ? visits.find((v) => v.id === visitId && v.incidentId === incidentId) : undefined

  const [date, setDate] = useState(visit?.date ?? todayISO())
  const [facility, setFacility] = useState(visit?.facilityName ?? '')
  const [notes, setNotes] = useState(visit?.notes ?? '')
  const [showPayment, setShowPayment] = useState(!!visit?.payment)
  const [amount, setAmount] = useState(visit?.payment?.amount ?? '')
  const [receipt, setReceipt] = useState(visit?.payment?.receiptNumber ?? '')
  const [paymentDate, setPaymentDate] = useState(visit?.payment?.date ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<false | 'save' | 'attach'>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [names] = useState(facilityNames)

  if (!incident) return <NotFound title="Incident not found" />
  if (visitId && !visit) return <NotFound title="Visit not found" />

  const attachedDocs = visit ? documents.filter((d) => visit.documentIds.includes(d.id)) : []

  const submit = async (then: 'save' | 'attach') => {
    const e: Record<string, string> = {}
    if (!date) e.date = 'Enter the visit date.'
    else if (date > todayISO()) e.date = 'A visit date can’t be in the future. Clinic-written appointments are added from documents.'
    if (!facility.trim()) e.facility = 'Enter the facility you visited.'
    if (showPayment && amount.trim() && !/^[\d,]+(\.\d{1,2})?$/.test(amount.trim())) e.amount = 'Enter numbers only, e.g. 1,250.00 — or leave blank.'
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      document.getElementById(`visit-${first}`)?.focus()
      return
    }
    const input: VisitInput = {
      date,
      facilityName: blankToNull(facility),
      notes: blankToNull(notes),
      payment:
        showPayment && (amount.trim() || receipt.trim() || paymentDate)
          ? { amount: blankToNull(amount), receiptNumber: blankToNull(receipt), date: paymentDate || null }
          : null,
    }
    setSaving(then)
    setSaveError(null)
    try {
      let id = visit?.id
      if (visit) await updateVisit(visit.id, input)
      else id = await createVisit(incident.id, input)
      if (then === 'attach') {
        navigate(`scan?incident=${incident.id}&visit=${id}`)
      } else {
        toast(visit ? 'Visit updated.' : 'Hospital visit added to the tracker.')
        navigate(`incidents/${incident.id}`)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <Screen
      title={visit ? 'Edit visit' : 'Add hospital visit'}
      subtitle={`For incident: ${animalText(incident)} · ${formatDate(incident.exposureDate)}`}
      back={`incidents/${incident.id}`}
      backLabel="Cancel"
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={() => submit('attach')} disabled={!!saving} className="btn min-h-12 flex-1 rounded-full border-mist bg-white text-navy">
            {saving === 'attach' ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Paperclip className="size-4" aria-hidden />}
            <span className="hidden sm:inline">Save and</span> attach document
          </button>
          <button type="button" onClick={() => submit('save')} disabled={!!saving} className="btn btn-primary min-h-12 flex-1 rounded-full">
            {saving === 'save' && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {visit ? 'Save changes' : 'Save visit'}
          </button>
        </div>
      }
    >
      {saveError && (
        <Notice tone="error" title="Couldn't save the visit" className="mb-4">
          {saveError} Your details are still here.
        </Notice>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit('save')
        }}
        className="flex flex-col gap-5"
      >
        <Card className="flex flex-col gap-6 p-5">
          <Field id="visit-date" label="Visit date" error={errors.date}>
            {(ids) => (
              <input id={ids.id} type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={ids.invalid} aria-describedby={ids.describedBy} className={inputClass} />
            )}
          </Field>
          <Field id="visit-facility" label="Facility" hint="Choose from the list or type the facility name." error={errors.facility}>
            {(ids) => (
              <>
                <input
                  id={ids.id}
                  list="facility-names"
                  type="text"
                  autoComplete="off"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  aria-invalid={ids.invalid}
                  aria-describedby={ids.describedBy}
                  className={inputClass}
                  placeholder="e.g. Lungsod Animal Bite Treatment Center"
                />
                <datalist id="facility-names">
                  {names.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <Field id="visit-notes" label="Your notes" optional hint="Anything you want to remember about this visit.">
            {(ids) => (
              <textarea id={ids.id} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} aria-describedby={ids.describedBy} className={textareaClass} placeholder="e.g. Nurse said to bring my card next time." />
            )}
          </Field>
          {visit?.treatmentAsRecorded && (
            <div className="rounded-2xl bg-canvas p-3.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/70">From reviewed document</p>
              <p className="mt-1 text-ink">
                {visit.rowLabel && <strong>{visit.rowLabel} · </strong>}
                {visit.treatmentAsRecorded}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input type="checkbox" className="toggle toggle-primary" checked={showPayment} onChange={(e) => setShowPayment(e.target.checked)} />
            <span className="flex items-center gap-2 text-sm font-bold text-ink">
              <Wallet className="size-4 text-royal" aria-hidden /> Add payment details
            </span>
          </label>
          {showPayment && (
            <div className="mt-5 flex flex-col gap-5">
              <Field id="visit-amount" label="Amount paid" optional hint="Leave blank if you don't know. Blank is saved as Not recorded, not zero." error={errors.amount}>
                {(ids) => (
                  <label className={`input h-12 w-full rounded-2xl border-mist bg-white text-base ${ids.invalid ? 'border-red-600' : ''}`}>
                    <span className="font-semibold text-ink/70">₱</span>
                    <input id={ids.id} type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={ids.invalid} aria-describedby={ids.describedBy} className="grow" placeholder="Not recorded" />
                  </label>
                )}
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="visit-receipt" label="Receipt number" optional>
                  {(ids) => <input id={ids.id} type="text" value={receipt} onChange={(e) => setReceipt(e.target.value)} className={inputClass} placeholder="Not recorded" />}
                </Field>
                <Field id="visit-paymentDate" label="Payment date" optional>
                  {(ids) => <input id={ids.id} type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} />}
                </Field>
              </div>
            </div>
          )}
        </Card>

        {visit && (
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-navy">Attached documents</h2>
              <a href={href(`scan?incident=${incident.id}&visit=${visit.id}`)} className="btn btn-sm min-h-11 rounded-full border-mist bg-white text-navy">
                <Paperclip className="size-4" aria-hidden /> Attach document
              </a>
            </div>
            {attachedDocs.length === 0 ? (
              <p className="mt-3 text-sm text-ink/70">No documents attached to this visit.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {attachedDocs.map((d) => (
                  <li key={d.id}>
                    <a href={href(`documents/${d.id}`)} className="flex min-h-12 items-center gap-2 rounded-2xl bg-canvas px-3 text-sm font-semibold text-navy hover:bg-pale">
                      <FileText className="size-4 text-royal" aria-hidden /> {docTypeLabels[d.type]}
                      <span className="font-normal text-ink/70">· {formatDate(d.reviewed.facility.documentDate.value)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <button type="submit" className="sr-only">
          Save visit
        </button>
      </form>
    </Screen>
  )
}
