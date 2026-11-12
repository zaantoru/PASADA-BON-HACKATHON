import { panelSectionId } from './panel'
import { ChevronDown, CircleCheck, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { inputClass, selectClass, textareaClass } from '@/components/common/form'
import { Card, NeedsCheckingBadge } from '@/components/common/ui'
import { animalLabels, docTypeLabels, entryTypeLabels } from '@/utils/format'
import type { DocType, EntryType } from '@/types/index'
import { needs, outstanding, type REntry, type RF, type ReviewApi } from '@/features/documents/review/model'

/* Field components for the document review form. */


export function StatusBadge({ field }: { field: RF }) {
  if (needs(field)) return <NeedsCheckingBadge />
  if (field.status === 'needs_checking' && field.resolved)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-navy">
        <CircleCheck className="size-3.5" aria-hidden /> Checked
      </span>
    )
  return null
}

export function RawWording({ field, show = true }: { field: RF; show?: boolean }) {
  if (!show || !field.raw || field.raw === field.value) return null
  return <p className="mt-1.5 text-xs text-ink/70">On document: “{field.raw}”</p>
}

export function CheckActions({ field, onChange, allowConfirm = true }: { field: RF; onChange: (p: Partial<RF>) => void; allowConfirm?: boolean }) {
  if (!needs(field)) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {allowConfirm && field.value.trim() !== '' && (
        <button type="button" onClick={() => onChange({ resolved: true })} className="btn btn-sm min-h-10 rounded-full border-royal bg-white text-royal hover:bg-pale">
          <CircleCheck className="size-4" aria-hidden /> Looks right
        </button>
      )}
      <button type="button" onClick={() => onChange({ value: '', resolved: true })} className="btn btn-sm btn-ghost min-h-10 rounded-full text-ink/80">
        Leave as unknown
      </button>
    </div>
  )
}

export function ReviewField({
  id,
  label,
  hint,
  field,
  onChange,
  type = 'text',
  inputMode,
  prefix,
}: {
  id: string
  label: string
  hint?: ReactNode
  field: RF
  onChange: (p: Partial<RF>) => void
  type?: 'text' | 'date' | 'textarea'
  inputMode?: 'decimal'
  prefix?: string
}) {
  const flagged = needs(field)
  const describedBy = [hint ? `${id}-hint` : '', field.note && flagged ? `${id}-note` : ''].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    value: field.value,
    placeholder: 'Not recorded',
    'aria-describedby': describedBy,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ value: e.target.value, resolved: true }),
  }
  const tone = flagged ? 'border-caution-ink/40 bg-caution/50' : ''
  return (
    <div className={`rounded-2xl ${flagged ? 'bg-caution/40 p-3 ring-1 ring-caution-ink/15' : ''}`}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
        </label>
        <StatusBadge field={field} />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mb-2 text-xs leading-relaxed text-ink/70">
          {hint}
        </p>
      )}
      {type === 'textarea' ? (
        <textarea {...common} rows={2} className={`${textareaClass} min-h-16 ${tone}`} />
      ) : prefix ? (
        <label className={`input h-12 w-full rounded-2xl border-mist bg-white text-base ${tone}`}>
          <span className="font-semibold text-ink/70">{prefix}</span>
          <input {...common} type="text" inputMode={inputMode} className="grow" />
        </label>
      ) : (
        <input {...common} type={type} inputMode={inputMode} className={`${inputClass} ${tone}`} />
      )}
      {field.note && flagged && (
        <p id={`${id}-note`} className="mt-1.5 text-xs font-medium text-caution-ink">
          {field.note}
        </p>
      )}
      <RawWording field={field} />
      <CheckActions field={field} onChange={onChange} />
    </div>
  )
}

export function ReviewChoice({
  id,
  label,
  hint,
  field,
  options,
  onChange,
}: {
  id: string
  label: string
  hint?: ReactNode
  field: RF
  options: { value: string; label: string }[]
  onChange: (p: Partial<RF>) => void
}) {
  const flagged = needs(field)
  return (
    <div id={id} tabIndex={-1} className={`rounded-2xl outline-none ${flagged ? 'bg-caution/40 p-3 ring-1 ring-caution-ink/15' : ''}`}>
      <fieldset aria-describedby={hint ? `${id}-hint` : undefined}>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <legend className="float-left text-sm font-bold text-ink">{label}</legend>
          <StatusBadge field={field} />
        </div>
        {hint && (
          <p id={`${id}-hint`} className="clear-both mb-2 text-xs leading-relaxed text-ink/70">
            {hint}
          </p>
        )}
        <div className="clear-both flex flex-wrap gap-2">
          {options.map((o) => (
            <label key={o.value} className="cursor-pointer">
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={needs(field) && field.value === '' ? false : field.value === o.value}
                onChange={() => onChange({ value: o.value, resolved: true })}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center rounded-2xl border border-mist bg-white px-4 text-sm font-semibold text-ink transition peer-checked:border-royal peer-checked:bg-royal peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-royal hover:border-cornflower">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {field.note && flagged && <p className="mt-1.5 text-xs font-medium text-caution-ink">{field.note}</p>}
      {field.raw && <p className="mt-1.5 text-xs text-ink/70">On document: “{field.raw}”</p>}
      <CheckActions field={field} onChange={onChange} />
    </div>
  )
}

export function ReviewSection({ title, description, count, children }: { title: string; description?: ReactNode; count: number; children: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink/70">{description}</p>}
        </div>
        {count > 0 && (
          <span className="shrink-0 rounded-full bg-caution px-2.5 py-1 text-xs font-bold text-caution-ink">{count} to check</span>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </Card>
  )
}

export function LinkOption({ checked, onSelect, children }: { checked: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name="link-incident" checked={checked} onChange={onSelect} className="peer sr-only" />
      <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-mist bg-white p-3 transition peer-checked:border-royal peer-checked:bg-pale peer-checked:ring-1 peer-checked:ring-royal peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-royal">
        {children}
      </span>
    </label>
  )
}

export function EntryCard({
  entry: e,
  setEntry,
  setEntryField,
}: {
  entry: REntry
  setEntry: (id: string, p: Partial<REntry>) => void
  setEntryField: (id: string, key: 'rowLabel' | 'dateWritten' | 'description', p: Partial<RF>) => void
}) {
  const typeFlagged = e.typeStatus === 'needs_checking' && !e.typeResolved
  const anyFlag = typeFlagged || needs(e.dateWritten) || needs(e.description)
  const label = e.rowLabel.value || 'Entry'

  if (!e.expanded) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-mist bg-canvas px-4 py-3">
        <span className="grid h-9 min-w-11 place-items-center rounded-xl bg-white px-2 text-sm font-bold text-navy ring-1 ring-mist">{label}</span>
        <p className="min-w-0 flex-1 text-sm text-ink/70">
          Printed row only · <span className="italic">Not recorded</span>
        </p>
        <button
          type="button"
          onClick={() => setEntry(e.id, { expanded: true })}
          className="btn btn-ghost btn-sm min-h-10 rounded-full text-royal"
          aria-label={`Add details to row ${label}`}
        >
          Add details <ChevronDown className="size-4" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border p-4 ${anyFlag ? 'border-caution-ink/25' : 'border-mist'}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 min-w-11 place-items-center rounded-xl bg-royal px-2 text-sm font-bold text-white">{label}</span>
        <p className="flex-1 text-sm font-semibold text-ink">{entryTypeLabels[e.entryType]}</p>
        {anyFlag && <NeedsCheckingBadge />}
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField id={`rv-entry-${e.id}-rowLabel`} label="Printed row label" field={e.rowLabel} onChange={(p) => setEntryField(e.id, 'rowLabel', p)} />
          <ReviewField id={`rv-entry-${e.id}-dateWritten`} label="Date written" type="date" field={e.dateWritten} onChange={(p) => setEntryField(e.id, 'dateWritten', p)} />
        </div>
        <ReviewField
          id={`rv-entry-${e.id}-description`}
          label="Treatment or notes as recorded"
          type="textarea"
          field={e.description}
          onChange={(p) => setEntryField(e.id, 'description', p)}
        />
        <div className={`rounded-2xl ${typeFlagged ? 'bg-caution/40 p-3 ring-1 ring-caution-ink/15' : ''}`}>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={`rv-entry-${e.id}-type`} className="text-sm font-bold text-ink">
              Entry type
            </label>
            {typeFlagged ? <NeedsCheckingBadge /> : null}
          </div>
          <select
            id={`rv-entry-${e.id}-type`}
            className={`${selectClass} ${typeFlagged ? 'border-caution-ink/40 bg-caution/50' : ''}`}
            value={e.entryType}
            aria-describedby={typeFlagged && e.typeNote ? `rv-entry-${e.id}-type-note` : undefined}
            onChange={(ev) => {
              const t = ev.target.value as EntryType
              setEntry(e.id, { entryType: t, typeResolved: true, addToTracker: t === 'recorded_visit' && !!e.dateWritten.value })
            }}
          >
            {Object.entries(entryTypeLabels).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          {typeFlagged && e.typeNote && (
            <p id={`rv-entry-${e.id}-type-note`} className="mt-1.5 text-xs font-medium text-caution-ink">
              {e.typeNote}
            </p>
          )}
          {typeFlagged && (
            <button
              type="button"
              onClick={() => setEntry(e.id, { typeResolved: true })}
              className="btn btn-sm mt-2 min-h-10 rounded-full border-royal bg-white text-royal hover:bg-pale"
            >
              <CircleCheck className="size-4" aria-hidden /> Keep “{entryTypeLabels[e.entryType]}”
            </button>
          )}
        </div>

        {e.entryType === 'recorded_visit' && (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl bg-canvas p-3">
            <input type="checkbox" className="checkbox checkbox-primary mt-0.5" checked={e.addToTracker} onChange={(ev) => setEntry(e.id, { addToTracker: ev.target.checked })} />
            <span className="text-sm">
              <span className="block font-semibold text-ink">Add to bite tracker as a hospital visit</span>
              <span className="block text-xs text-ink/70">A visit on the same date is updated instead of duplicated.</span>
            </span>
          </label>
        )}
        {e.entryType === 'scheduled_follow_up' && (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl bg-canvas p-3">
            <input type="checkbox" className="checkbox checkbox-primary mt-0.5" checked={e.addToTracker} onChange={(ev) => setEntry(e.id, { addToTracker: ev.target.checked })} />
            <span className="text-sm">
              <span className="block font-semibold text-ink">The clinic wrote this as an appointment. Show it in my tracker.</span>
              <span className="block text-xs text-ink/70">Leave unchecked if you're not sure. It stays with the document either way.</span>
            </span>
          </label>
        )}
        {(e.entryType === 'observation' || e.entryType === 'unclear') && (
          <p className="rounded-2xl bg-canvas p-3 text-xs text-ink/70">Saved with the document only. Not added to the tracker.</p>
        )}
      </div>
    </div>
  )
}


/** The editable review form, grouped into the document-details panel sections. */
export function ReviewSections({ api }: { api: ReviewApi }) {
  const { s, setField, setPayment, addPayment, setEntry, setEntryField, setDocType } = api
  const todo = outstanding(s)
  const count = (prefix: string) => todo.filter((t) => t.id.startsWith(prefix)).length
  return (
    <div className="flex flex-col gap-4">
      <div id={panelSectionId('people')} className="scroll-mt-24">
        <ReviewSection title="Patient and incident details" description="As written on the document." count={count('rv-patient') + count('rv-incident')}>
          <ReviewField id="rv-patient-name" label="Patient name" field={s.patient.name} onChange={(p) => setField('patient', 'name', p)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <ReviewField id="rv-patient-birthday" label="Birthday" type="date" field={s.patient.birthday} onChange={(p) => setField('patient', 'birthday', p)} />
            <ReviewField id="rv-patient-idNumber" label="Card or registration number" field={s.patient.idNumber} onChange={(p) => setField('patient', 'idNumber', p)} />
          </div>
          <ReviewField
            id="rv-patient-address"
            label="Patient address"
            hint="Kept with this document. It isn't used as the incident location."
            field={s.patient.address}
            onChange={(p) => setField('patient', 'address', p)}
          />
          <div className="border-t border-mist" />
          <ReviewField id="rv-incident-exposureDate" label="Exposure date" type="date" field={s.incident.exposureDate} onChange={(p) => setField('incident', 'exposureDate', p)} />
          <ReviewChoice
            id="rv-incident-animalType"
            label="Animal type"
            hint="Choose the box that is ticked on the document."
            field={s.incident.animalType}
            options={[
              { value: 'dog', label: animalLabels.dog },
              { value: 'cat', label: animalLabels.cat },
              { value: 'other', label: 'Others' },
              { value: '', label: 'Not recorded' },
            ]}
            onChange={(p) => setField('incident', 'animalType', p)}
          />
          <ReviewField id="rv-incident-bodyArea" label="Affected body area" hint="Where on the body, as written." field={s.incident.bodyArea} onChange={(p) => setField('incident', 'bodyArea', p)} />
          <ReviewField id="rv-incident-place" label="Place of exposure" hint="Where the incident happened, as written." field={s.incident.place} onChange={(p) => setField('incident', 'place', p)} />
          <ReviewChoice
            id="rv-incident-category"
            label="Exposure category recorded on document"
            hint="Select only what the clinic marked. PASADA doesn't assign categories."
            field={s.incident.category}
            options={[
              { value: 'I', label: 'I' },
              { value: 'II', label: 'II' },
              { value: 'III', label: 'III' },
              { value: '', label: 'Not recorded' },
            ]}
            onChange={(p) => setField('incident', 'category', p)}
          />
        </ReviewSection>
      </div>

      <div id={panelSectionId('facility')} className="scroll-mt-24">
        <ReviewSection title="Facility and document information" count={count('rv-facility')}>
          <ReviewField id="rv-facility-name" label="Facility name" field={s.facility.name} onChange={(p) => setField('facility', 'name', p)} />
          <div>
            <label htmlFor="rv-doctype" className="mb-1.5 block text-sm font-bold text-ink">
              Document type
            </label>
            <select id="rv-doctype" className={selectClass} value={s.documentType} onChange={(e) => setDocType(e.target.value as DocType)}>
              {Object.entries(docTypeLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ReviewField id="rv-facility-documentDate" label="Document date" hint="When the document was issued." type="date" field={s.facility.documentDate} onChange={(p) => setField('facility', 'documentDate', p)} />
            <ReviewField id="rv-facility-formRevision" label="Form revision" hint="Printed form version — not a visit date." field={s.facility.formRevision} onChange={(p) => setField('facility', 'formRevision', p)} />
          </div>
        </ReviewSection>
      </div>

      <div id={panelSectionId('visits')} className="scroll-mt-24">
        <ReviewSection
          title="Recorded visits and follow-ups"
          description="Printed rows aren't treated as visits or appointments unless you choose."
          count={count('rv-entry')}
        >
          {s.entries.length === 0 && <p className="text-sm italic text-ink/70">No visit entries on this document.</p>}
          {s.entries.map((e) => (
            <EntryCard key={e.id} entry={e} setEntry={setEntry} setEntryField={setEntryField} />
          ))}
        </ReviewSection>
      </div>

      <div id={panelSectionId('payment')} className="scroll-mt-24">
        {s.payment ? (
          <ReviewSection title="Payment information" count={count('rv-payment')}>
            <ReviewField
              id="rv-payment-amount"
              label="Amount paid"
              prefix="₱"
              inputMode="decimal"
              hint="Leave blank if not shown. A blank amount is saved as Not recorded, not zero."
              field={s.payment.amount}
              onChange={(p) => setPayment('amount', p)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <ReviewField id="rv-payment-receiptNumber" label="Receipt number" field={s.payment.receiptNumber} onChange={(p) => setPayment('receiptNumber', p)} />
              <ReviewField id="rv-payment-paymentDate" label="Payment date" type="date" field={s.payment.paymentDate} onChange={(p) => setPayment('paymentDate', p)} />
            </div>
          </ReviewSection>
        ) : (
          <button
            type="button"
            onClick={addPayment}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-mist bg-white text-sm font-semibold text-navy hover:border-cornflower"
          >
            <Wallet className="size-4" aria-hidden /> No payment on this document · Add payment details
          </button>
        )}
      </div>
    </div>
  )
}
