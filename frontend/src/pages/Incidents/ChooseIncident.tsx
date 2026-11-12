import { PencilLine } from 'lucide-react'
import { useState } from 'react'
import { AnimalIcon } from '@/components/common/AnimalIcon'
import { EmptyRecordsIllustration } from '@/components/common/Illustrations'
import { Screen } from '@/components/layout/Screen'
import { Card, EmptyState, FieldError } from '@/components/common/ui'
import { animalText, formatDate } from '@/utils/format'
import { href, navigate } from '@/utils/router'
import { useRecords } from '@/utils/useRecords'

/** Global "Add hospital visit": every visit must belong to an incident. */
export function ChooseIncident() {
  const { incidents, visits } = useRecords()
  const [selected, setSelected] = useState<string | null>(incidents.length === 1 ? incidents[0].id : null)
  const [error, setError] = useState(false)
  const sorted = [...incidents].sort((a, b) => (b.exposureDate ?? '').localeCompare(a.exposureDate ?? ''))

  return (
    <Screen title="Add hospital visit" subtitle="Which incident is this visit for?" back="records" backLabel="Back to records">
      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<EmptyRecordsIllustration className="w-48" />}
            title="Record an incident first"
            body="Each hospital visit is linked to an incident, so your timeline stays organized."
          >
            <a href={href('incidents/new')} className="btn btn-primary min-h-12 rounded-full">
              <PencilLine className="size-5" aria-hidden /> Record incident
            </a>
          </EmptyState>
        </Card>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!selected) return setError(true)
            navigate(`incidents/${selected}/visits/new`)
          }}
        >
          <fieldset className="grid gap-2" aria-describedby={error ? 'choose-error' : undefined}>
            <legend className="mb-3 text-sm font-bold text-ink">Choose an incident</legend>
            {sorted.map((inc) => {
              const n = visits.filter((v) => v.incidentId === inc.id).length
              return (
                <label key={inc.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="incident"
                    className="peer sr-only"
                    checked={selected === inc.id}
                    onChange={() => (setSelected(inc.id), setError(false))}
                  />
                  <span className="flex min-h-16 items-center gap-3 rounded-3xl border border-transparent bg-white p-4 shadow-card transition peer-checked:border-royal peer-checked:ring-1 peer-checked:ring-royal peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-royal">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
                      <AnimalIcon type={inc.animalType} className="size-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-ink">
                        {animalText(inc)} · {formatDate(inc.exposureDate)}
                      </span>
                      <span className="block truncate text-sm text-ink/70">
                        {inc.location ?? 'Location not recorded'} · {n} visit{n === 1 ? '' : 's'}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </fieldset>
          <FieldError id="choose-error">{error ? 'Choose the incident this visit belongs to.' : null}</FieldError>
          <button type="submit" className="btn btn-primary mt-6 min-h-12 w-full rounded-full text-base">
            Continue
          </button>
          <a href={href('incidents/new')} className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-royal hover:underline">
            It's a new incident — record it first
          </a>
        </form>
      )}
    </Screen>
  )
}
