import { Cat, CircleHelp, Dog, LoaderCircle, PawPrint, Pencil, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { Field, GroupField, inputClass, textareaClass } from '@/components/common/form'
import { Screen } from '@/components/layout/Screen'
import { Card, ChoiceChips, InfoRow, Notice } from '@/components/common/ui'
import { animalText, blankToNull, bodyAreaText, formatDate, todayISO } from '@/utils/format'
import { href, navigate } from '@/utils/router'
import type { AnimalType, IncidentInput } from '@/types/index'
import { useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'
import { NotFound } from '@/pages/NotFound'

const BODY_AREAS = ['Head or face', 'Neck', 'Arm', 'Hand or fingers', 'Chest, back, or abdomen', 'Leg', 'Foot', 'Other']

const animalOptions = [
  { value: 'dog' as const, label: 'Dog', icon: Dog },
  { value: 'cat' as const, label: 'Cat', icon: Cat },
  { value: 'other' as const, label: 'Other', icon: PawPrint },
  { value: 'unknown' as const, label: 'Unknown', icon: CircleHelp },
]

interface Draft {
  exposureDate: string
  location: string
  animalType: AnimalType | null
  animalOther: string
  bodyAreas: string[]
  bodyAreaDetail: string
  notes: string
}

type Errors = Partial<Record<'exposureDate' | 'location' | 'animalType' | 'bodyArea', string>>

function validate(d: Draft): Errors {
  const e: Errors = {}
  if (!d.exposureDate) e.exposureDate = 'Enter the date of the incident or exposure.'
  else if (d.exposureDate > todayISO()) e.exposureDate = 'The incident date can’t be in the future.'
  if (!d.location.trim()) e.location = 'Enter where the incident happened. A general area is fine.'
  if (!d.animalType) e.animalType = 'Choose the animal type, or “Unknown”.'
  if (!d.bodyAreas.length && !d.bodyAreaDetail.trim()) e.bodyArea = 'Choose at least one affected body area.'
  return e
}

const fieldOrder: (keyof Errors)[] = ['exposureDate', 'location', 'animalType', 'bodyArea']

export function IncidentForm({ incidentId }: { incidentId?: string }) {
  const { incidents, createIncident, updateIncident } = useRecords()
  const toast = useToast()
  const existing = incidentId ? incidents.find((i) => i.id === incidentId) : undefined

  const [draft, setDraft] = useState<Draft>(() => ({
    exposureDate: existing?.exposureDate ?? '',
    location: existing?.location ?? '',
    animalType: existing?.animalType ?? null,
    animalOther: existing?.animalOther ?? '',
    bodyAreas: existing?.bodyAreas ?? [],
    bodyAreaDetail: existing?.bodyAreaDetail ?? '',
    notes: existing?.notes ?? '',
  }))
  const [step, setStep] = useState<'edit' | 'review'>('edit')
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (incidentId && !existing) return <NotFound title="Incident not found" />

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    if (Object.keys(errors).length) setErrors((e) => ({ ...e, ...{ [key === 'bodyAreas' || key === 'bodyAreaDetail' ? 'bodyArea' : key]: undefined } }))
  }

  const toInput = (): IncidentInput => ({
    exposureDate: draft.exposureDate || null,
    location: blankToNull(draft.location),
    animalType: draft.animalType ?? 'unknown',
    animalOther: draft.animalType === 'other' ? blankToNull(draft.animalOther) : null,
    bodyAreas: draft.bodyAreas,
    bodyAreaDetail: blankToNull(draft.bodyAreaDetail),
    notes: blankToNull(draft.notes),
    source: existing?.source ?? 'manual',
  })

  const goReview = () => {
    const e = validate(draft)
    setErrors(e)
    const first = fieldOrder.find((k) => e[k])
    if (first) {
      document.getElementById(`inc-${first}`)?.focus()
      return
    }
    setStep('review')
    window.scrollTo(0, 0)
  }

  const save = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      if (existing) {
        await updateIncident(existing.id, toInput())
        toast('Incident updated.')
        navigate(`incidents/${existing.id}`)
      } else {
        const id = await createIncident(toInput())
        toast('Incident saved. You can now add hospital visits.')
        navigate(`incidents/${id}`)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong while saving.')
      setSaving(false)
    }
  }

  const backTo = existing ? `incidents/${existing.id}` : ''
  const preview = toInput()

  if (step === 'review') {
    return (
      <Screen
        key="review"
        title="Review incident"
        subtitle="Check these details before saving."
        back={backTo}
        backLabel="Cancel"
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn min-h-12 flex-1 rounded-full border-mist bg-white text-navy" onClick={() => setStep('edit')} disabled={saving}>
              <Pencil className="size-4" aria-hidden /> Edit
            </button>
            <button type="button" className="btn btn-primary min-h-12 flex-[2] rounded-full" onClick={save} disabled={saving}>
              {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {saving ? 'Saving…' : existing ? 'Save changes' : 'Save incident'}
            </button>
          </div>
        }
      >
        {saveError && (
          <Notice tone="error" title="Couldn't save the incident" className="mb-4">
            {saveError} Your details are still here — try again.
          </Notice>
        )}
        <Card className="p-5">
          <dl className="divide-y divide-mist">
            <InfoRow label="Date of incident/exposure" value={formatDate(preview.exposureDate)} />
            <InfoRow label="Location of incident" value={preview.location} />
            <InfoRow label="Animal type" value={animalText(preview)} />
            <InfoRow label="Affected body area" value={bodyAreaText(preview)} />
            <InfoRow label="Patient-reported notes" value={preview.notes} />
          </dl>
        </Card>
        <p className="mt-4 px-1 text-xs leading-relaxed text-ink/70">
          Saved details are labeled <strong>User-confirmed</strong>. PASADA doesn't assess the exposure or assign a category.
        </p>
      </Screen>
    )
  }

  return (
    <Screen
      key="edit"
      title={existing ? 'Edit incident' : 'Record incident'}
      subtitle={existing ? 'Update what happened.' : 'Tell us what happened. You can add hospital visits next.'}
      back={backTo}
      backLabel="Cancel"
      footer={
        <button type="button" className="btn btn-primary min-h-12 w-full rounded-full text-base" onClick={goReview}>
          Review incident
        </button>
      }
    >
      {!existing && (
        <a href={href('scan?type=treatment_card')} className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl bg-pale px-4 py-3 text-sm font-semibold text-navy hover:bg-mist">
          <ScanLine className="size-5 text-royal" aria-hidden />
          Have a treatment card? Scan it to prefill these details.
        </a>
      )}
      {Object.values(errors).some(Boolean) && (
        <Notice tone="error" title="Please check the highlighted fields" className="mb-5" />
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          goReview()
        }}
        className="flex flex-col gap-6"
      >
        <Card className="flex flex-col gap-6 p-5">
          <Field id="inc-exposureDate" label="Date of incident/exposure" error={errors.exposureDate}>
            {(ids) => (
              <input
                id={ids.id}
                type="date"
                max={todayISO()}
                value={draft.exposureDate}
                onChange={(e) => set('exposureDate', e.target.value)}
                aria-invalid={ids.invalid}
                aria-describedby={ids.describedBy}
                className={inputClass}
              />
            )}
          </Field>

          <Field
            id="inc-location"
            label="Location of incident"
            hint="Where it happened — e.g. street, barangay, city. This isn't your home address or the hospital's address."
            error={errors.location}
          >
            {(ids) => (
              <input
                id={ids.id}
                type="text"
                autoComplete="off"
                placeholder="e.g. Brgy. Malinis, Quezon City"
                value={draft.location}
                onChange={(e) => set('location', e.target.value)}
                aria-invalid={ids.invalid}
                aria-describedby={ids.describedBy}
                className={inputClass}
              />
            )}
          </Field>
        </Card>

        <Card className="flex flex-col gap-6 p-5">
          <GroupField id="inc-animalType" label="Animal type" error={errors.animalType}>
            <ChoiceChips
              name="animalType"
              legend="Animal type"
              options={animalOptions}
              value={draft.animalType}
              onChange={(v) => set('animalType', v)}
              columns={4}
            />
            {draft.animalType === 'other' && (
              <div className="mt-3">
                <Field id="inc-animalOther" label="Which animal?" optional>
                  {(ids) => (
                    <input id={ids.id} type="text" value={draft.animalOther} onChange={(e) => set('animalOther', e.target.value)} className={inputClass} placeholder="e.g. Monkey" />
                  )}
                </Field>
              </div>
            )}
          </GroupField>

          <GroupField
            id="inc-bodyArea"
            label="Affected body area"
            hint="Where on your body the bite or scratch happened. Choose all that apply."
            error={errors.bodyArea}
          >
            <ChoiceChips
              name="bodyAreas"
              legend="Affected body area"
              multiple
              options={BODY_AREAS.map((a) => ({ value: a, label: a }))}
              value={draft.bodyAreas}
              onChange={(v) =>
                set('bodyAreas', draft.bodyAreas.includes(v) ? draft.bodyAreas.filter((x) => x !== v) : [...draft.bodyAreas, v])
              }
            />
            <div className="mt-3">
              <Field id="inc-bodyAreaDetail" label="Body area details" optional>
                {(ids) => (
                  <input
                    id={ids.id}
                    type="text"
                    placeholder="e.g. Left calf"
                    value={draft.bodyAreaDetail}
                    onChange={(e) => set('bodyAreaDetail', e.target.value)}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
          </GroupField>
        </Card>

        <Card className="p-5">
          <Field
            id="inc-notes"
            label="Patient-reported notes"
            optional
            hint="Describe what happened in your own words. These notes are for your records only."
          >
            {(ids) => (
              <textarea
                id={ids.id}
                value={draft.notes}
                onChange={(e) => set('notes', e.target.value)}
                aria-describedby={ids.describedBy}
                className={textareaClass}
                rows={4}
                placeholder="e.g. Neighbor's dog, it was walking loose near the sari-sari store."
              />
            )}
          </Field>
        </Card>
        <button type="submit" className="sr-only">
          Review incident
        </button>
      </form>
    </Screen>
  )
}
