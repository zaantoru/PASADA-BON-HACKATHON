import { FilePlus2 } from 'lucide-react'
import { AnimalIcon } from '@/components/common/AnimalIcon'
import { Card, FieldError } from '@/components/common/ui'
import { animalText, formatDate } from '@/utils/format'
import type { Incident } from '@/types/index'
import { useRecords } from '@/utils/useRecords'
import { LinkOption } from '@/features/documents/review/ReviewFields'

/** Every document belongs to an incident: pick an existing one or confirm creating a new one. */
export function IncidentLinkPicker({
  target,
  onTarget,
  confirmNew,
  onConfirmNew,
  preview,
  attempted,
}: {
  target: string | null
  onTarget: (t: string) => void
  confirmNew: boolean
  onConfirmNew: (v: boolean) => void
  preview: Pick<Incident, 'exposureDate' | 'location' | 'animalType' | 'animalOther' | 'bodyAreaDetail'>
  attempted: boolean
}) {
  const { incidents, visits } = useRecords()
  const sorted = [...incidents].sort((a, b) => (b.exposureDate ?? '').localeCompare(a.exposureDate ?? ''))
  return (
    <Card className="p-5">
      <div id="rv-link" tabIndex={-1} className="outline-none">
        <h2 className="text-lg font-bold text-navy">Save to an incident</h2>
        <p className="mt-0.5 text-sm text-ink/70">So this card stays attached to the right record.</p>
        <fieldset className="mt-4 grid gap-2">
          <legend className="sr-only">Choose an incident</legend>
          {sorted.map((inc) => {
            const count = visits.filter((x) => x.incidentId === inc.id).length
            return (
              <LinkOption key={inc.id} checked={target === inc.id} onSelect={() => onTarget(inc.id)}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pale text-royal">
                  <AnimalIcon type={inc.animalType} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">
                    {animalText(inc)} · {formatDate(inc.exposureDate)}
                  </span>
                  <span className="block truncate text-xs text-ink/70">
                    {inc.location ?? 'Location not recorded'} · {count} visit{count === 1 ? '' : 's'}
                  </span>
                </span>
              </LinkOption>
            )
          })}
          <LinkOption checked={target === 'new'} onSelect={() => onTarget('new')}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal text-white">
              <FilePlus2 className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">Create a new incident</span>
              <span className="block text-xs text-ink/70">Uses the incident details you reviewed</span>
            </span>
          </LinkOption>
        </fieldset>
        {attempted && !target && <FieldError id="rv-link-error">Choose an incident, or create a new one.</FieldError>}
      </div>

      {target === 'new' && (
        <div className="mt-4 rounded-2xl bg-canvas p-4">
          <p className="text-sm font-bold text-navy">New incident</p>
          <dl className="mt-2 grid gap-1.5 text-sm">
            {[
              ['Exposure date', formatDate(preview.exposureDate)],
              ['Animal type', preview.animalType === 'unknown' ? 'Not recorded' : animalText(preview)],
              ['Affected body area', preview.bodyAreaDetail ?? 'Not recorded'],
              ['Location of incident', preview.location ?? 'Not recorded'],
            ].map(([k, val]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-36 shrink-0 text-ink/70">{k}</dt>
                <dd className={val === 'Not recorded' ? 'italic text-ink/70' : 'font-semibold'}>{val}</dd>
              </div>
            ))}
          </dl>
          <label id="rv-confirm-new" className="mt-4 flex min-h-11 cursor-pointer items-start gap-3">
            <input type="checkbox" className="checkbox checkbox-primary mt-0.5" checked={confirmNew} onChange={(e) => onConfirmNew(e.target.checked)} />
            <span className="text-sm font-semibold text-ink">I confirm these incident details. Create the new incident.</span>
          </label>
          {attempted && !confirmNew && <FieldError id="rv-confirm-error">Confirm the details to create the incident.</FieldError>}
        </div>
      )}
      {target && target !== 'new' && (
        <p className="mt-3 text-xs leading-relaxed text-ink/70">The incident's saved details stay as they are. You can edit the incident later.</p>
      )}
    </Card>
  )
}
