import { ChevronRight, MapPin, Stethoscope } from 'lucide-react'
import { animalText, bodyAreaText, formatDate } from '@/utils/format'
import { href } from '@/utils/router'
import type { Incident } from '@/types/index'
import { AnimalIcon } from '@/components/common/AnimalIcon'

export function IncidentCard({ incident, visitCount }: { incident: Incident; visitCount: number }) {
  return (
    <a
      href={href(`incidents/${incident.id}`)}
      className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition hover:ring-2 hover:ring-cornflower"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
        <AnimalIcon type={incident.animalType} className="size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-ink/70">{formatDate(incident.exposureDate)}</span>
        <span className="block truncate font-bold text-ink">
          {animalText(incident)} · {bodyAreaText(incident)}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/70">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{incident.location ?? 'Location not recorded'}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-navy">
            <Stethoscope className="size-3.5" aria-hidden />
            {visitCount} visit{visitCount === 1 ? '' : 's'}
          </span>
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-royal" aria-hidden />
    </a>
  )
}
