import { EyeOff, LoaderCircle, MapPin, PencilLine } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { BottomSheet } from '@/components/common/BottomSheet'
import { selectClass } from '@/components/common/form'
import { DemoBadge, Notice } from '@/components/common/ui'
import { animalLabels } from '@/utils/format'
import type { AnimalType } from '@/types/index'
import { demoPlaces } from '@/mocks/facilities'
import { buildReport, submitCommunityReport } from '@/service/communityReportService'
import { matchPlace } from '@/service/facilityService'

/** Explicit opt-in. Only the approximate area, animal type, and month are ever included. */
function CommunitySheetContent({
  open,
  onClose,
  place,
  animal,
  exposureDate,
  onShared,
  onSkip,
  onEditLocation,
}: {
  open: boolean
  onClose: () => void
  place: string | null
  animal: string | null
  exposureDate: string | null
  onShared: () => void
  onSkip: () => void
  onEditLocation: () => void
}) {
  const [areaId, setAreaId] = useState(() => matchPlace(place)?.id ?? '')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)


  const area = demoPlaces.find((p) => p.id === areaId) ?? null
  const report = area ? buildReport(area, animal, exposureDate) : null
  const month = report?.month ? new Date(`${report.month}-01T00:00:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'Not recorded'

  const share = async () => {
    if (!report || !consent) return
    setBusy(true)
    await submitCommunityReport(report)
    setBusy(false)
    onShared()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow={<DemoBadge>Demo — saved on this device only</DemoBadge>}
      title="Share an anonymized bite report"
      footer={
        place ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onSkip} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
              Skip
            </button>
            <button type="button" onClick={share} disabled={!consent || !report || busy} className="btn btn-primary min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
              {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Share report
            </button>
          </div>
        ) : undefined
      }
    >
      {!place ? (
        <div className="flex flex-col gap-3">
          <Notice tone="caution" title="Incident location not confirmed">
            A report needs the place where the incident happened, as you confirmed it. You can add it in your document details, or skip this step.
          </Notice>
          <button type="button" onClick={onEditLocation} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
            <PencilLine className="size-4" aria-hidden /> Add incident location
          </button>
          <button type="button" onClick={onSkip} className="btn btn-ghost min-h-12 rounded-full text-ink/80">
            Skip
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink/80">
            This counts as an <strong>animal-bite report</strong>, not a rabies case. It helps show where bites are happening. Skipping doesn’t change your records.
          </p>
          <div>
            <label htmlFor="cr-area" className="mb-1.5 block text-sm font-bold text-ink">
              Approximate area
            </label>
            <select id="cr-area" className={selectClass} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Choose the area that matches your location</option>
              {demoPlaces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-ink/70">Your confirmed location: “{place}”. Only the broader area is shared.</p>
          </div>
          {report && (
            <div className="rounded-2xl bg-pale p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-navy">What would be shared</p>
              <dl className="mt-2 grid gap-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/70">Area</dt>
                  <dd className="flex items-center gap-1 font-semibold">
                    <MapPin className="size-4 text-royal" aria-hidden /> {report.areaName} (approximate)
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/70">Animal</dt>
                  <dd className="font-semibold">{report.animal === 'unknown' ? 'Not recorded' : animalLabels[report.animal as AnimalType]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/70">Month</dt>
                  <dd className="font-semibold">{month}</dd>
                </div>
              </dl>
            </div>
          )}
          <Notice tone="info" icon={EyeOff} title="Never shared">
            Your name, card photo, exact address, and any medical or treatment details.
          </Notice>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-mist p-4">
            <input type="checkbox" className="checkbox checkbox-primary mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={!report} />
            <span className="text-sm text-ink">I agree to share this anonymized report.</span>
          </label>
          <p className="text-xs text-ink/70">Prototype: the report is stored on this device only and isn’t sent or published.</p>
        </div>
      )}
    </BottomSheet>
  )
}

export function CommunitySheet(props: ComponentProps<typeof CommunitySheetContent>) {
  return props.open ? <CommunitySheetContent key={props.place ?? 'unknown'} {...props} /> : null
}
