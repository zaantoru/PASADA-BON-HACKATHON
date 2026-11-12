import L from 'leaflet'
import { BellRing, ChevronRight, Info, MapPinned } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Marker } from 'react-leaflet'
import { BottomSheet } from '@/components/common/BottomSheet'
import { selectClass } from '@/components/common/form'
import { FlyTo, MapBase } from '@/components/maps/MapBase'
import { MapLayout } from '@/components/maps/MapLayout'
import { Card, DemoBadge, Notice, Segmented } from '@/components/common/ui'
import { formatDate } from '@/utils/format'
import type { HotspotAnimal, HotspotArea, ReportPeriod } from '@/types/index'
import { DEFAULT_CENTER } from '@/mocks/facilities'
import { countFor, levelFor, listHotspots, periodLabels, type HotspotLevel } from '@/service/hotspotService'
import { useAlerts } from '@/utils/useAlerts'

const levelStyle: Record<HotspotLevel, { size: number; bg: string; fg: string; label: string }> = {
  fewer: { size: 38, bg: '#68A4F1', fg: '#061E47', label: 'Fewer reports' },
  moderate: { size: 48, bg: '#2B6AD0', fg: '#FFFFFF', label: 'Moderate' },
  more: { size: 60, bg: '#1F4591', fg: '#FFFFFF', label: 'More reports' },
}

function spotIcon(count: number, level: HotspotLevel, selected: boolean) {
  const s = levelStyle[level]
  return L.divIcon({
    className: 'pasada-hotspot',
    html: `<span class="spot ${selected ? 'is-selected' : ''}" style="background:${s.bg};color:${s.fg}">${count}</span>`,
    iconSize: [s.size, s.size],
    iconAnchor: [s.size / 2, s.size / 2],
  })
}

const animalWord = (a: HotspotAnimal) => (a === 'dog' ? 'dog' : a === 'cat' ? 'cat' : 'dog and cat')

export function Hotspots() {
  const { prefs, setNotifyOnHotspotEntry, simulateEntry } = useAlerts()
  const [areas, setAreas] = useState<HotspotArea[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [animal, setAnimal] = useState<HotspotAnimal>('all')
  const [period, setPeriod] = useState<ReportPeriod>('90d')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [fly, setFly] = useState<{ lat: number; lng: number } | null>(null)

  const load = () => {
    setStatus('loading')
    listHotspots()
      .then((a) => (setAreas(a), setStatus('ready')))
      .catch(() => setStatus('error'))
  }
  useEffect(() => {
    let active = true
    listHotspots().then((items) => {
      if (active) { setAreas(items); setStatus('ready') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [])

  const rows = useMemo(() => {
    const withCounts = areas.map((a) => ({ a, count: countFor(a, period, animal) })).filter((x) => x.count > 0)
    const max = Math.max(0, ...withCounts.map((x) => x.count))
    return withCounts.map((x) => ({ ...x, level: levelFor(x.count, max) })).sort((p, q) => q.count - p.count)
  }, [areas, period, animal])

  const selected = areas.find((a) => a.id === selectedId) ?? null
  const select = (a: HotspotArea) => {
    setSelectedId(a.id)
    setSheetOpen(true)
    setFly({ lat: a.lat, lng: a.lng })
  }

  const simulate = (a: HotspotArea | null) => {
    const target = a ?? rows[0]?.a
    if (target) simulateEntry({ areaName: target.name, city: target.city })
  }

  const map = (
    <div className="relative size-full">
      <MapBase center={DEFAULT_CENTER} zoom={11} label="Map of reported bite hotspots" className="size-full">
        {rows.map(({ a, count, level }) => (
          <Marker
            key={`${a.id}-${count}-${level}-${a.id === selectedId}`}
            position={[a.lat, a.lng]}
            icon={spotIcon(count, level, a.id === selectedId)}
            title={`${a.name}, ${a.city}: ${count} reported bite incidents`}
            alt={`${a.name}: ${count} reports`}
            eventHandlers={{ click: () => select(a) }}
          />
        ))}
        {fly && <FlyTo lat={fly.lat} lng={fly.lng} zoom={13} />}
      </MapBase>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[600] rounded-2xl bg-white/95 p-3 shadow-card">
        <p className="text-xs font-bold text-ink">Reported bite incidents</p>
        <ul className="mt-1.5 grid gap-1">
          {(Object.keys(levelStyle) as HotspotLevel[]).map((l) => (
            <li key={l} className="flex items-center gap-2 text-xs text-ink">
              <span className="inline-block rounded-full border-2 border-white shadow" style={{ background: levelStyle[l].bg, width: 10 + levelStyle[l].size / 5, height: 10 + levelStyle[l].size / 5 }} />
              {levelStyle[l].label}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-[11px] text-ink/70">Relative to areas shown</p>
      </div>
    </div>
  )

  return (
    <MapLayout
      title="Bite hotspots"
      subtitle="Areas with reported dog or cat bite incidents."
      controls={
        <>
          <Segmented
            label="Animal"
            onDark
            value={animal}
            onChange={setAnimal}
            options={[
              { value: 'all', label: 'All' },
              { value: 'dog', label: 'Dogs' },
              { value: 'cat', label: 'Cats' },
            ]}
          />
          <div>
            <label htmlFor="period" className="sr-only">
              Reporting period
            </label>
            <select id="period" value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)} className={`${selectClass} border-0`}>
              {Object.entries(periodLabels).map(([k, l]) => (
                <option key={k} value={k}>
                  Reporting period: {l}
                </option>
              ))}
            </select>
          </div>
        </>
      }
      map={map}
    >
      <div className="flex flex-col gap-5">
        <Notice title="Reported bite incidents, not confirmed rabies cases">
          Counts are anonymized and grouped by area. No patient details or home addresses are shown.
          <span className="mt-2 flex">
            <DemoBadge>Demo data</DemoBadge>
          </span>
        </Notice>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
              <BellRing className="size-5" aria-hidden />
            </span>
            <label htmlFor="hotspot-alert" className="min-w-0 flex-1 cursor-pointer">
              <span className="block text-sm font-bold text-ink">Notify me when I enter a reported bite hotspot.</span>
              <span className="mt-0.5 block text-xs text-ink/70">Saved on this device.</span>
            </label>
            <input
              id="hotspot-alert"
              type="checkbox"
              className="toggle toggle-primary mt-1"
              checked={prefs.notifyOnHotspotEntry}
              onChange={(e) => setNotifyOnHotspotEntry(e.target.checked)}
            />
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-navy/30 p-3.5">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink/80">
              <Info className="mt-0.5 size-4 shrink-0 text-royal" aria-hidden />
              Prototype: your location isn't tracked in the background. Use the simulation to preview the alert.
            </p>
            <button
              type="button"
              onClick={() => simulate(null)}
              disabled={!prefs.notifyOnHotspotEntry || rows.length === 0}
              aria-describedby={!prefs.notifyOnHotspotEntry ? 'simulate-hint' : undefined}
              className="btn btn-primary mt-3 min-h-12 w-full rounded-full"
            >
              <MapPinned className="size-5" aria-hidden /> Simulate hotspot entry
            </button>
            {!prefs.notifyOnHotspotEntry && (
              <p id="simulate-hint" className="mt-2 text-center text-xs text-ink/70">
                Turn on the alert above to try the simulation.
              </p>
            )}
          </div>
        </Card>

        <section aria-labelledby="areas-heading">
          <div className="mb-3">
            <h2 id="areas-heading" className="text-lg font-bold text-navy">
              Areas
            </h2>
            <p className="text-sm text-ink/70">
              {periodLabels[period]} · {animalWord(animal)} bites
            </p>
          </div>
          {status === 'loading' && (
            <ul className="grid gap-2" aria-label="Loading areas">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="skeleton h-16 rounded-3xl bg-white" />
              ))}
            </ul>
          )}
          {status === 'error' && (
            <Notice tone="error" title="Couldn't load hotspot reports">
              <button type="button" onClick={load} className="btn btn-sm mt-2 min-h-10 rounded-full">
                Try again
              </button>
            </Notice>
          )}
          {status === 'ready' && rows.length === 0 && <p className="rounded-3xl bg-white p-5 text-sm text-ink/70 shadow-card">No reports for this filter and period.</p>}
          {status === 'ready' && rows.length > 0 && (
            <ul className="grid gap-2">
              {rows.map(({ a, count, level }) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => select(a)}
                    aria-current={a.id === selectedId ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-3xl bg-white p-3.5 text-left shadow-card transition hover:ring-2 hover:ring-cornflower ${a.id === selectedId ? 'ring-2 ring-royal' : ''}`}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-extrabold" style={{ background: levelStyle[level].bg, color: levelStyle[level].fg }}>
                      {count}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">{a.name}</span>
                      <span className="block text-xs text-ink/70">
                        {a.city} · {levelStyle[level].label}
                      </span>
                    </span>
                    <ChevronRight className="size-5 text-royal" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <BottomSheet
        open={sheetOpen && !!selected}
        onClose={() => setSheetOpen(false)}
        eyebrow={<DemoBadge>Demo data · area level</DemoBadge>}
        title={selected ? `${selected.name}, ${selected.city}` : ''}
        footer={
          selected && (
            <button
              type="button"
              onClick={() => simulate(selected)}
              disabled={!prefs.notifyOnHotspotEntry}
              className="btn btn-primary min-h-12 w-full rounded-full"
            >
              <MapPinned className="size-5" aria-hidden />
              {prefs.notifyOnHotspotEntry ? 'Simulate entering this area' : 'Turn on alerts to simulate'}
            </button>
          )
        }
      >
        {selected && <AreaDetails area={selected} period={period} />}
      </BottomSheet>
    </MapLayout>
  )
}

function AreaDetails({ area, period }: { area: HotspotArea; period: ReportPeriod }) {
  const r = area.reports[period]
  const total = r.dog + r.cat
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-pale p-4">
        <p className="text-4xl font-extrabold text-navy">{total}</p>
        <p className="text-sm font-semibold text-ink">reported bite incidents</p>
        <p className="text-xs text-ink/70">{periodLabels[period]}</p>
      </div>
      <div className="grid gap-3">
        {[
          ['Dog bites', r.dog],
          ['Cat bites', r.cat],
        ].map(([label, n]) => (
          <div key={label as string}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-ink">{label}</span>
              <span className="font-bold text-navy">{n}</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-pale" aria-hidden>
              <div className="h-full rounded-full bg-royal" style={{ width: `${total ? ((n as number) / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-ink/70">
        These are reported bite incidents, not confirmed rabies cases. Counts are grouped by area; no patient details or exact addresses are shown. Last updated {formatDate(area.updated)}.
      </p>
    </div>
  )
}
