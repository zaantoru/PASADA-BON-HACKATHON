import { PencilLine, Plus, RotateCcw, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { EmptyRecordsIllustration } from '@/components/common/Illustrations'
import { IncidentCard } from '@/components/common/IncidentCard'
import { Screen } from '@/components/layout/Screen'
import { Card, EmptyState, SectionHeading } from '@/components/common/ui'
import { href } from '@/utils/router'
import { useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'

export function Records() {
  const { incidents, visits, reset } = useRecords()
  const toast = useToast()
  const [confirmReset, setConfirmReset] = useState(false)
  const sorted = [...incidents].sort((a, b) => (b.exposureDate ?? b.createdAt).localeCompare(a.exposureDate ?? a.createdAt))

  return (
    <Screen
      title="Records"
      subtitle="Your incidents and their linked hospital visits."
      headerContent={
        incidents.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <a href={href('incidents/new')} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-0 bg-white px-3 text-navy hover:bg-pale">
              <Plus className="size-5" aria-hidden /> Record incident
            </a>
            <a href={href('visits/new')} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-white/40 bg-white/10 px-3 text-white hover:bg-white/20">
              <Plus className="size-5" aria-hidden /> Add hospital visit
            </a>
          </div>
        )
      }
    >
      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<EmptyRecordsIllustration className="w-52" />}
            title="No incidents yet"
            body="Record an incident to start your bite tracker. Hospital visits and documents are saved under each incident."
          >
            <a href={href('scan?type=treatment_card')} className="btn btn-primary min-h-12 rounded-full">
              <ScanLine className="size-5" aria-hidden /> Scan treatment card
            </a>
            <a href={href('incidents/new')} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
              <PencilLine className="size-5" aria-hidden /> Record incident manually
            </a>
          </EmptyState>
        </Card>
      ) : (
        <section aria-labelledby="incidents-heading">
          <SectionHeading id="incidents-heading" title="Incidents" description={`${sorted.length} saved`} />
          <ul className="grid gap-3">
            {sorted.map((i) => (
              <li key={i.id}>
                <IncidentCard incident={i} visitCount={visits.filter((v) => v.incidentId === i.id).length} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 border-t border-mist pt-4 text-center">
        {confirmReset ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-ink/80">Delete all prototype records on this device?</span>
            <button
              type="button"
              className="btn btn-sm min-h-10 rounded-full border-0 bg-red-700 text-white hover:bg-red-800"
              onClick={async () => {
                await reset()
                setConfirmReset(false)
                toast('Prototype data cleared.')
              }}
            >
              Delete
            </button>
            <button type="button" className="btn btn-sm btn-ghost min-h-10 rounded-full" onClick={() => setConfirmReset(false)}>
              Keep
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink/70 hover:text-ink">
            <RotateCcw className="size-3.5" aria-hidden /> Reset prototype data
          </button>
        )}
      </div>
    </Screen>
  )
}
