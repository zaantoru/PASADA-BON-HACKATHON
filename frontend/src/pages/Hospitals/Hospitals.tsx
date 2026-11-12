import L from 'leaflet'
import { ArrowLeft, BadgeCheck, Building2, Clock, Crosshair, ExternalLink, HandCoins, HeartHandshake, LocateFixed, MapPin, Navigation, Phone, Search, ShieldCheck, Star, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Marker } from 'react-leaflet'
import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyMapIllustration } from '@/components/common/Illustrations'
import { FlyTo, MapBase } from '@/components/maps/MapBase'
import { MapLayout } from '@/components/maps/MapLayout'
import { Card, DemoBadge, EmptyState, Notice, Segmented, Stars } from '@/components/common/ui'
import { distanceKm, docTypeLabels, formatDate } from '@/utils/format'
import { href, navigate } from '@/utils/router'
import type { AssistanceOffice, Facility, PlaceOption } from '@/types/index'
import { DEFAULT_CENTER, demoPlaces } from '@/mocks/facilities'
import { averageRating, listAssistanceOffices, listFacilities, searchPlaces } from '@/service/facilityService'
import { guideProgress } from '@/service/guideProgress'
import { useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'

type Ownership = 'all' | 'public' | 'private'
type ListTab = 'facilities' | 'assistance'
type Ref = { lat: number; lng: number; label: string; source: 'gps' | 'manual' }

const assistSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>'
const hospitalSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>'

const iconCache = new Map<string, L.DivIcon>()
function pinIcon(ownership: Facility['ownership'] | 'assist', selected: boolean) {
  const key = `${ownership}-${selected}`
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: 'pasada-pin',
        html: `<span class="pin ${ownership} ${selected ? 'is-selected' : ''}">${ownership === 'assist' ? assistSvg : hospitalSvg}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      }),
    )
  }
  return iconCache.get(key)!
}
const userIcon = L.divIcon({ className: 'pasada-user', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] })

/**
 * Facility and assistance directory. When opened from a document guide (`from`), it keeps that
 * context, offers "Back to your guide", and can save a preferred option for the guide.
 */
export function Hospitals({ query: params }: { query?: URLSearchParams }) {
  const from = params?.get('from') ?? null
  const { documents, followUps } = useRecords()
  const toast = useToast()
  const guideDoc = from ? (documents.find((d) => d.id === from) ?? null) : null
  const nextAppt = guideDoc
    ? (followUps.filter((f) => f.documentId === guideDoc.id).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null)
    : null
  const initialPlace = demoPlaces.find((p) => p.id === params?.get('near')) ?? null
  const focusId = params?.get('focus') ?? null

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [tab, setTab] = useState<ListTab>(params?.get('tab') === 'assistance' ? 'assistance' : 'facilities')
  const [aStatus, setAStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [offices, setOffices] = useState<AssistanceOffice[]>([])
  const [query, setQuery] = useState('')
  const [ownership, setOwnership] = useState<Ownership>(() => {
    const o = params?.get('ownership')
    return o === 'public' || o === 'private' ? o : 'all'
  })
  const [selectedId, setSelectedId] = useState<string | null>(focusId)
  const [sheetOpen, setSheetOpen] = useState(!!focusId)
  const [officeId, setOfficeId] = useState<string | null>(focusId)
  const [ref, setRef] = useState<Ref | null>(initialPlace ? { lat: initialPlace.lat, lng: initialPlace.lng, label: initialPlace.name, source: 'manual' } : null)
  const [geo, setGeo] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle')
  const [placeSheet, setPlaceSheet] = useState(false)
  const [fly, setFly] = useState<{ lat: number; lng: number; zoom?: number } | null>(initialPlace ? { lat: initialPlace.lat, lng: initialPlace.lng, zoom: 13 } : null)

  const load = () => {
    setStatus('loading')
    listFacilities()
      .then((f) => {
        setFacilities(f)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }
  useEffect(() => {
    let active = true
    listFacilities().then((items) => {
      if (active) { setFacilities(items); setStatus('ready') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [])
  const loadOffices = () => {
    setAStatus('loading')
    listAssistanceOffices()
      .then((o) => {
        setOffices(o)
        setAStatus('ready')
      })
      .catch(() => setAStatus('error'))
  }
  useEffect(() => {
    let active = true
    listAssistanceOffices().then((items) => {
      if (active) { setOffices(items); setAStatus('ready') }
    }).catch(() => { if (active) setAStatus('error') })
    return () => { active = false }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = facilities
      .filter((f) => ownership === 'all' || f.ownership === ownership)
      .filter((f) => !q || [f.name, f.area, f.city, f.address].some((x) => x.toLowerCase().includes(q)))
      .map((f) => ({ f, km: ref ? distanceKm(ref, f) : null }))
    if (ref) list.sort((a, b) => a.km! - b.km!)
    return list
  }, [facilities, query, ownership, ref])

  const selected = facilities.find((f) => f.id === selectedId) ?? null
  const office = offices.find((o) => o.id === officeId) ?? null
  const focusedLocation = facilities.find((f) => f.id === focusId) ?? offices.find((o) => o.id === focusId)
  const mapTarget = fly ?? (focusedLocation ? { lat: focusedLocation.lat, lng: focusedLocation.lng, zoom: 14 } : null)

  const officeResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = offices
      .filter((o) => !q || [o.name, o.hostName, o.city].some((x) => x.toLowerCase().includes(q)))
      .map((o) => ({ o, km: ref ? distanceKm(ref, o) : null }))
    if (ref) list.sort((a, b) => a.km! - b.km!)
    return list
  }, [offices, query, ref])

  const selectOffice = (o: AssistanceOffice) => {
    setOfficeId(o.id)
    setSheetOpen(false)
    setFly({ lat: o.lat, lng: o.lng, zoom: 14 })
  }

  const choose = (kind: 'facility' | 'assistance', id: string, name: string) => {
    if (!from) return
    guideProgress.update(from, { preferred: { kind, id, name, savedAt: new Date().toISOString() }, assistance: 'accepted' })
    toast('Saved as your preferred option. Remember to contact them first.')
    navigate(`documents/${from}`)
  }

  const select = (f: Facility) => {
    setSelectedId(f.id)
    setOfficeId(null)
    setSheetOpen(true)
    setFly({ lat: f.lat, lng: f.lng, zoom: 15 })
  }

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeo('unavailable')
    setGeo('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const r = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your location', source: 'gps' as const }
        setRef(r)
        setGeo('idle')
        setFly({ lat: r.lat, lng: r.lng, zoom: 13 })
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  const setManual = (p: PlaceOption) => {
    setRef({ lat: p.lat, lng: p.lng, label: p.name, source: 'manual' })
    setGeo('idle')
    setPlaceSheet(false)
    setFly({ lat: p.lat, lng: p.lng, zoom: 13 })
  }

  const map = (
    <MapBase center={DEFAULT_CENTER} zoom={12} label="Map of health facilities" className="size-full">
      {tab === 'assistance' &&
        officeResults.map(({ o }) => (
          <Marker
            key={o.id}
            position={[o.lat, o.lng]}
            icon={pinIcon('assist', o.id === officeId)}
            title={`${o.name} (assistance office)`}
            alt={o.name}
            zIndexOffset={o.id === officeId ? 1000 : 0}
            eventHandlers={{ click: () => selectOffice(o) }}
          />
        ))}
      {tab === 'facilities' && results.map(({ f }) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={pinIcon(f.ownership, f.id === selectedId)}
          title={`${f.name} (${f.ownership})`}
          alt={f.name}
          zIndexOffset={f.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => select(f) }}
        />
      ))}
      {ref && <Marker position={[ref.lat, ref.lng]} icon={userIcon} title={ref.label} keyboard={false} interactive={false} />}
      {mapTarget && <FlyTo lat={mapTarget.lat} lng={mapTarget.lng} zoom={mapTarget.zoom} />}
    </MapBase>
  )

  return (
    <MapLayout
      title="Hospitals"
      subtitle={tab === 'assistance' ? 'Offices where you can ask about financial assistance.' : 'Find facilities that list animal-bite services.'}
      controls={
        <>
          {from && (
            <div className="flex flex-col gap-2">
              <a href={href(`documents/${from}`)} className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-navy shadow-card hover:bg-pale">
                <ArrowLeft className="size-4" aria-hidden /> Back to your guide
              </a>
              {guideDoc && (
                <p className="text-xs text-white/85">
                  For your {docTypeLabels[guideDoc.type].toLowerCase()}
                  {nextAppt ? ` · next recorded appointment ${formatDate(nextAppt.date)}` : ' · no confirmed appointment'}
                </p>
              )}
            </div>
          )}
          <Segmented
            label="What to show"
            onDark
            value={tab}
            onChange={(v) => {
              setTab(v)
              setSheetOpen(false)
              setOfficeId(null)
            }}
            options={[
              { value: 'facilities', label: 'Treatment facilities' },
              { value: 'assistance', label: 'Assistance offices' },
            ]}
          />
          <label className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 text-ink shadow-card focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-white">
            <Search className="size-5 shrink-0 text-royal" aria-hidden />
            <span className="sr-only">Search by facility or area</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'assistance' ? 'Search by office, hospital, or city' : 'Search by facility or area'}
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink/50"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="grid size-9 place-items-center rounded-full hover:bg-pale" aria-label="Clear search">
                <X className="size-4" aria-hidden />
              </button>
            )}
          </label>
          {tab === 'facilities' && <Segmented
            label="Facility type"
            onDark
            value={ownership}
            onChange={setOwnership}
            options={[
              { value: 'all', label: 'All' },
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' },
            ]}
          />}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={locate} disabled={geo === 'locating'} className="btn min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-white/40 bg-white/10 px-3 text-white hover:bg-white/20 disabled:bg-white/10 disabled:text-white/80">
              {geo === 'locating' ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <LocateFixed className="size-4" aria-hidden />}
              {geo === 'locating' ? 'Locating…' : 'Use my location'}
            </button>
            <button type="button" onClick={() => setPlaceSheet(true)} className="btn min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-white/40 bg-white/10 px-3 text-white hover:bg-white/20">
              <Crosshair className="size-4" aria-hidden /> Set location
            </button>
          </div>
        </>
      }
      map={map}
    >
      <div aria-live="polite" className="flex flex-col gap-3">
        {geo === 'denied' && (
          <Notice tone="caution" title="Location permission denied">
            You can still search by facility or area, or{' '}
            <button type="button" className="font-semibold underline" onClick={() => setPlaceSheet(true)}>
              set your location manually
            </button>
            .
          </Notice>
        )}
        {geo === 'unavailable' && (
          <Notice tone="caution" title="Couldn't get your location">
            Try again, or{' '}
            <button type="button" className="font-semibold underline" onClick={() => setPlaceSheet(true)}>
              set your location manually
            </button>
            .
          </Notice>
        )}
        {ref && (
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm shadow-card">
            <MapPin className="size-4 text-royal" aria-hidden />
            <span className="flex-1">
              Sorted by distance from <strong>{ref.label}</strong>
            </span>
            <button type="button" onClick={() => setRef(null)} className="grid size-10 place-items-center rounded-full hover:bg-pale" aria-label="Clear location">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {tab === 'assistance' && (
        <AssistanceList
          status={aStatus}
          results={officeResults}
          activeId={officeId}
          onSelect={selectOffice}
          onRetry={loadOffices}
          onShowFacilities={() => setTab('facilities')}
        />
      )}

      {tab === 'facilities' && <>
      <div className="mb-3 mt-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-navy">{status === 'ready' ? `${results.length} ${results.length === 1 ? 'facility' : 'facilities'}` : 'Facilities'}</h2>
        <DemoBadge>Mostly demo listings</DemoBadge>
      </div>

      {status === 'loading' && (
        <ul className="grid gap-3" aria-label="Loading facilities">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex gap-3 rounded-3xl bg-white p-4 shadow-card">
              <div className="skeleton size-12 shrink-0 rounded-2xl bg-pale" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 bg-pale" />
                <div className="skeleton h-3 w-1/2 bg-pale" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {status === 'error' && (
        <Notice tone="error" title="Couldn't load facilities">
          <button type="button" onClick={load} className="btn btn-sm mt-2 min-h-10 rounded-full">
            Try again
          </button>
        </Notice>
      )}
      {status === 'ready' && results.length === 0 && (
        <Card>
          <EmptyState illustration={<EmptyMapIllustration className="w-40" />} title="No facilities found" body="Try another facility name or area, or switch the filter to All.">
            <button
              type="button"
              className="btn btn-primary min-h-12 rounded-full"
              onClick={() => {
                setQuery('')
                setOwnership('all')
              }}
            >
              Clear search and filter
            </button>
          </EmptyState>
        </Card>
      )}
      {status === 'ready' && results.length > 0 && (
        <ul className="grid gap-3">
          {results.map(({ f, km }) => {
            const avg = averageRating(f)
            const active = f.id === selectedId
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => select(f)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-start gap-3 rounded-3xl bg-white p-4 text-left shadow-card transition hover:ring-2 hover:ring-cornflower ${active ? 'ring-2 ring-royal' : ''}`}
                >
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${f.ownership === 'public' ? 'bg-royal text-white' : 'bg-pale text-royal ring-1 ring-royal/40'}`}>
                    {f.ownership === 'public' ? <ShieldCheck className="size-6" aria-hidden /> : <Building2 className="size-6" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug text-ink">{f.name}</span>
                    <span className="mt-0.5 block text-sm text-ink/70">
                      {f.area}, {f.city}
                      {km !== null && ` · ${km.toFixed(1)} km`}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${f.ownership === 'public' ? 'bg-pale text-navy' : 'bg-white text-navy ring-1 ring-mist'}`}>
                        {f.ownership === 'public' ? 'Public facility' : 'Private'}
                      </span>
                      <SourceTag demo={f.demo} />
                      {f.demo && (avg !== null ? (
                        <span className="inline-flex items-center gap-1 text-ink/70">
                          <Stars rating={avg} size="size-3.5" /> {avg.toFixed(1)} · {f.reviews.length} demo review{f.reviews.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-ink/70">No reviews yet</span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      </>}

      <BottomSheet
        open={sheetOpen && !!selected}
        onClose={() => setSheetOpen(false)}
        eyebrow={
          selected && (
            <span className="flex flex-wrap gap-2">
              <span className="rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-navy">{selected.ownership === 'public' ? 'Public facility' : 'Private facility'}</span>
              <SourceTag demo={selected.demo} />
            </span>
          )
        }
        title={selected?.name}
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              {from && (
                <button type="button" onClick={() => choose('facility', selected.id, selected.name)} className="btn btn-primary col-span-2 min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
                  <Star className="size-4" aria-hidden /> Choose this facility
                </button>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noreferrer"
                className={`btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3 ${from ? 'border-mist bg-white text-navy' : 'btn-primary'}`}
              >
                <Navigation className="size-4" aria-hidden /> View directions
              </a>
              {selected.phone ? (
                <a href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
                  <Phone className="size-4" aria-hidden /> Contact facility
                </a>
              ) : (
                <button type="button" disabled className="btn min-h-12 rounded-full">
                  No contact listed
                </button>
              )}
            </div>
          )
        }
      >
        {selected && <FacilityDetails f={selected} km={ref ? distanceKm(ref, selected) : null} fromGuide={!!from} />}
      </BottomSheet>

      <BottomSheet
        open={!!office}
        onClose={() => setOfficeId(null)}
        eyebrow={
          office && (
            <span className="flex flex-wrap gap-2">
              <span className="rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-navy">{office.kind === 'malasakit' ? 'Malasakit Center' : 'Medical social service'}</span>
              <SourceTag demo={office.demo} />
            </span>
          )
        }
        title={office?.name}
        footer={
          office && (
            <div className="grid grid-cols-2 gap-2">
              {from && (
                <button type="button" onClick={() => choose('assistance', office.id, office.name)} className="btn btn-primary col-span-2 min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
                  <Star className="size-4" aria-hidden /> Choose this office
                </button>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.hostName)}`}
                target="_blank"
                rel="noreferrer"
                className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy"
              >
                <Navigation className="size-4" aria-hidden /> Find on map
              </a>
              {office.phone ? (
                <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`} className="btn min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
                  <Phone className="size-4" aria-hidden /> Contact office
                </a>
              ) : (
                <button type="button" disabled className="btn min-h-12 rounded-full">
                  No contact listed
                </button>
              )}
            </div>
          )
        }
      >
        {office && <OfficeDetails o={office} km={ref ? distanceKm(ref, office) : null} />}
      </BottomSheet>

      <PlaceSheet open={placeSheet} onClose={() => setPlaceSheet(false)} onPick={setManual} />
    </MapLayout>
  )
}

function SourceTag({ demo }: { demo: boolean }) {
  return demo ? (
    <span className="rounded-full border border-dashed border-navy/40 px-2 py-0.5 text-xs font-bold text-navy">Demo listing</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
      <BadgeCheck className="size-3.5" aria-hidden /> From official source
    </span>
  )
}

function SourceLine({ name, url, checked }: { name: string; url: string; checked: string }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-ink/70">
      Source:{' '}
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-royal hover:underline">
        {name} <ExternalLink className="size-3" aria-hidden />
      </a>{' '}
      · Last checked {formatDate(checked)}
    </p>
  )
}

function FacilityDetails({ f, km, fromGuide }: { f: Facility; km: number | null; fromGuide: boolean }) {
  const avg = averageRating(f)
  const designation = f.sourced ? 'Animal Bite Treatment Center (as named in the source)' : f.demo ? 'Not verified — demo listing' : 'Not verified'
  return (
    <div className="flex flex-col gap-5">
      {fromGuide && (
        <Notice tone="info" title="Before you go">
          Contact the facility to ask whether they can see you for your follow-up visit. Bring your treatment card.
        </Notice>
      )}
      <dl className="grid gap-3 text-sm">
        <div className="flex gap-3">
          <dt>
            <MapPin className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Address</span>
          </dt>
          <dd>
            {f.approximateLocation ? `${f.address}. ${f.area}, ${f.city}` : `${f.address}, ${f.area}, ${f.city}`}
            {f.approximateLocation && <span className="block text-xs text-ink/70">Map pin is approximate.</span>}
            {km !== null && <span className="block text-xs text-ink/70">About {km.toFixed(1)} km away (straight line)</span>}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <ShieldCheck className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Designation</span>
          </dt>
          <dd>
            {designation}
            <span className="block text-xs text-ink/70">{f.ownership === 'public' ? 'Public facility' : 'Private facility'}</span>
          </dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <Clock className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Hours</span>
          </dt>
          <dd>{f.sourced?.hours ?? <span className="italic text-ink/70">Hours not verified — contact the facility</span>}</dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <Phone className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Contact</span>
          </dt>
          <dd>{f.phone ?? <span className="italic text-ink/70">Not listed</span>}</dd>
        </div>
      </dl>

      <section>
        <h3 className="text-sm font-bold text-ink">Listed animal-bite services</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {f.services.map((s) => (
            <li key={s} className="rounded-full bg-pale px-3 py-1.5 text-xs font-semibold text-navy">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-ink/70">
          {f.sourced
            ? 'Services as listed in the source. Vaccine availability isn’t guaranteed — contact the facility to confirm.'
            : 'Services as listed in the demo directory. Stock, schedules, and opening status aren’t shown — contact the facility to confirm.'}
        </p>
      </section>

      <section>
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <HandCoins className="size-4 text-royal" aria-hidden /> Cost
        </h3>
        {f.sourced?.cost ? (
          <>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{f.sourced.cost}</p>
            {f.sourced.costNote && <p className="mt-1.5 text-sm leading-relaxed text-ink">{f.sourced.costNote}</p>}
            <SourceLine name={f.sourced.sourceName} url={f.sourced.sourceUrl} checked={f.sourced.lastChecked} />
          </>
        ) : (
          <p className="mt-1.5 text-sm text-ink">
            {f.ownership === 'public' ? 'Public facility · ' : ''}Cost information needs confirmation. Ask the facility before your visit.
          </p>
        )}
      </section>

      {f.demo && <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-ink">Reviews</h3>
          <DemoBadge>Demo reviews</DemoBadge>
        </div>
        {avg !== null ? (
          <>
            <p className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-extrabold text-navy">{avg.toFixed(1)}</span>
              <Stars rating={avg} />
              <span className="text-sm text-ink/70">
                {f.reviews.length} review{f.reviews.length > 1 ? 's' : ''}
              </span>
            </p>
            <ul className="mt-3 grid gap-2">
              {f.reviews.map((r) => (
                <li key={r.id} className="rounded-2xl bg-canvas p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Stars rating={r.rating} size="size-3.5" />
                    <span className="text-xs text-ink/70">{formatDate(r.date)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink">{r.text}</p>
                  <p className="mt-1 text-xs text-ink/70">{r.author}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink/70">Sample reviews for the prototype — not from real patients.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink/70">No reviews yet.</p>
        )}
      </section>}
    </div>
  )
}

function AssistanceList({
  status,
  results,
  activeId,
  onSelect,
  onRetry,
  onShowFacilities,
}: {
  status: 'loading' | 'ready' | 'error'
  results: { o: AssistanceOffice; km: number | null }[]
  activeId: string | null
  onSelect: (o: AssistanceOffice) => void
  onRetry: () => void
  onShowFacilities: () => void
}) {
  return (
    <>
      <div className="mb-3 mt-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-navy">{status === 'ready' ? `${results.length} assistance office${results.length === 1 ? '' : 's'}` : 'Assistance offices'}</h2>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-ink/75">
        These offices can tell you about financial assistance. Each request is assessed — approval and amounts aren’t guaranteed.
      </p>
      {status === 'loading' && (
        <ul className="grid gap-3" aria-label="Loading assistance offices">
          {[0, 1].map((i) => (
            <li key={i} className="h-24 rounded-3xl bg-white p-4 shadow-card">
              <div className="skeleton h-4 w-2/3 bg-pale" />
              <div className="skeleton mt-2 h-3 w-1/2 bg-pale" />
            </li>
          ))}
        </ul>
      )}
      {status === 'error' && (
        <Notice tone="error" title="Assistance results are unavailable right now">
          You can still browse treatment facilities, or ask the hospital’s social service office directly.
          <span className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={onRetry} className="btn btn-sm min-h-10 rounded-full">
              Try again
            </button>
            <button type="button" onClick={onShowFacilities} className="btn btn-sm min-h-10 rounded-full border-mist bg-white text-navy">
              Show treatment facilities
            </button>
          </span>
        </Notice>
      )}
      {status === 'ready' && results.length === 0 && (
        <Card>
          <EmptyState illustration={<EmptyMapIllustration className="w-40" />} title="No assistance offices found" body="Try another name or city." />
        </Card>
      )}
      {status === 'ready' && results.length > 0 && (
        <ul className="grid gap-3">
          {results.map(({ o, km }) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onSelect(o)}
                aria-current={o.id === activeId ? 'true' : undefined}
                className={`flex w-full items-start gap-3 rounded-3xl bg-white p-4 text-left shadow-card transition hover:ring-2 hover:ring-cornflower ${o.id === activeId ? 'ring-2 ring-royal' : ''}`}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pale text-navy ring-1 ring-navy/30">
                  <HeartHandshake className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug text-ink">{o.name}</span>
                  <span className="mt-0.5 block text-sm text-ink/70">
                    {o.hostName} · {o.city}
                    {km !== null && ` · ${km.toFixed(1)} km`}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-pale px-2 py-0.5 font-bold text-navy">Assistance available for inquiry</span>
                    <SourceTag demo={o.demo} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function OfficeDetails({ o, km }: { o: AssistanceOffice; km: number | null }) {
  return (
    <div className="flex flex-col gap-5">
      <Notice tone="info" title="Assistance available for inquiry">
        Ask the office what support may apply to your visit. Approval, amounts, and reimbursement aren’t guaranteed.
      </Notice>
      <dl className="grid gap-3 text-sm">
        <div className="flex gap-3">
          <dt>
            <MapPin className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Location</span>
          </dt>
          <dd>
            {o.address ?? `Inside ${o.hostName}, ${o.city}`}
            {o.approximateLocation && <span className="block text-xs text-ink/70">Map pin is approximate.</span>}
            {km !== null && <span className="block text-xs text-ink/70">About {km.toFixed(1)} km away (straight line)</span>}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <Clock className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Hours</span>
          </dt>
          <dd>{o.hours ?? <span className="italic text-ink/70">Hours not verified — contact the office</span>}</dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <Phone className="mt-0.5 size-5 text-royal" aria-hidden />
            <span className="sr-only">Contact</span>
          </dt>
          <dd>{o.phone ?? <span className="italic text-ink/70">Not listed</span>}</dd>
        </div>
      </dl>
      <section>
        <h3 className="text-sm font-bold text-ink">About this office</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{o.description ?? 'No official description on file yet. Contact the office to ask what assistance they handle.'}</p>
        {o.whoMayAvail && <p className="mt-1.5 text-sm leading-relaxed text-ink">{o.whoMayAvail}</p>}
      </section>
      <section>
        <h3 className="text-sm font-bold text-ink">Requirements</h3>
        {o.requirements?.length ? (
          <div className="mt-2 grid gap-3">
            {o.requirements.map((g) => (
              <div key={g.group} className="rounded-2xl bg-canvas p-3.5">
                <p className="text-sm font-semibold text-navy">{g.group}</p>
                <ul className="mt-1.5 list-disc pl-5 text-sm leading-relaxed text-ink">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-ink/70">Requirements can change and may differ for your situation. Confirm with the office.</p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm italic text-ink/70">Requirements not verified — ask the office before you go.</p>
        )}
      </section>
      {o.sourceName && o.sourceUrl && o.lastChecked ? (
        <SourceLine name={o.sourceName} url={o.sourceUrl} checked={o.lastChecked} />
      ) : (
        <p className="text-xs text-ink/70">Demo listing — fictional, for the prototype only.</p>
      )}
    </div>
  )
}

function PlaceSheet({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (p: PlaceOption) => void }) {
  const [q, setQ] = useState('')
  const [places, setPlaces] = useState<PlaceOption[]>([])
  useEffect(() => {
    if (!open) return
    let live = true
    searchPlaces(q).then((p) => live && setPlaces(p))
    return () => {
      live = false
    }
  }, [q, open])
  return (
    <BottomSheet open={open} onClose={onClose} title="Set your location">
      <p className="text-sm text-ink/70">Choose an area to sort facilities by distance. Your location isn't saved.</p>
      <label className="mt-3 flex h-12 items-center gap-2 rounded-2xl border border-mist bg-white px-4 focus-within:border-royal">
        <Search className="size-5 text-royal" aria-hidden />
        <span className="sr-only">Search for a city or area</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="City or area, e.g. Pasig" className="h-full min-w-0 flex-1 bg-transparent text-base outline-none" />
      </label>
      <ul className="mt-3 grid gap-1">
        {places.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p)} className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold hover:bg-pale">
              <MapPin className="size-4 text-royal" aria-hidden /> {p.name}
            </button>
          </li>
        ))}
        {places.length === 0 && <li className="px-3 py-4 text-sm text-ink/70">No matching areas in the demo list.</li>}
      </ul>
    </BottomSheet>
  )
}
