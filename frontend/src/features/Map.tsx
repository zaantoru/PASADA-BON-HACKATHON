import { useEffect, useRef, useState } from 'react'
import { divIcon, latLng } from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { FACILITY_KIND_LABELS, distanceKm } from '../service/api/overpass'
import type { FacilityKind, LatLon, NearbyFacility } from '../service/api/overpass'
import { useNearbyFacilities } from '../utils/useNearbyFacilities'

/* ----------------------------- Constants ----------------------------- */

// Pasig City. Used until the user shares their location or moves the map.
const DEFAULT_CENTER: LatLon = { lat: 14.5764, lon: 121.0851 }
const DEFAULT_ZOOM = 13
const RADIUS_OPTIONS_KM = [2, 5, 10] as const

const KIND_COLORS: Record<FacilityKind, string> = {
  abtc: '#dc2626',
  hospital: '#1f4591',
  health_center: '#68a4f1',
}

function createPin(color: string) {
  // Static markup only (no OpenStreetMap text), so it is safe to inject as HTML.
  return divIcon({
    className: '',
    html: `<span style="position:relative;display:block;width:26px;height:26px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(6,30,71,.45)"><span style="position:absolute;top:7px;left:7px;width:8px;height:8px;border-radius:50%;background:#fff"></span></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 31],
    popupAnchor: [0, -28],
  })
}

const PIN_ICONS: Record<FacilityKind, ReturnType<typeof createPin>> = {
  abtc: createPin(KIND_COLORS.abtc),
  hospital: createPin(KIND_COLORS.hospital),
  health_center: createPin(KIND_COLORS.health_center),
}

type KindFilter = 'all' | FacilityKind

const FILTERS: { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'abtc', label: 'Bite centers' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'health_center', label: 'Health centers' },
]

/* ----------------------------- Map helpers ----------------------------- */

interface FlyTarget {
  center: LatLon
  /** Fit this search radius in view. Omit to center on a point instead. */
  radiusKm?: number
  zoom?: number
}

function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap()

  useEffect(() => {
    if (!target) return
    const center = latLng(target.center.lat, target.center.lon)
    if (target.radiusKm) {
      map.flyToBounds(center.toBounds(target.radiusKm * 2000), { duration: 0.8 })
    } else {
      map.flyTo(center, target.zoom ?? map.getZoom(), { duration: 0.8 })
    }
  }, [map, target])

  return null
}

function ViewTracker({ onMove }: { onMove: (center: LatLon) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      onMove({ lat: center.lat, lon: center.lng })
    },
  })
  return null
}

/* ----------------------------- Facility popup + marker ----------------------------- */

function FacilityDetails({ facility }: { facility: NearbyFacility }) {
  const phone = facility.phone?.split(/[;,]/)[0]?.trim()
  const phoneHref = phone ? phone.replace(/[^\d+]/g, '') : ''
  // OpenStreetMap tags are free text, so only allow web links.
  const website = facility.website && /^https?:\/\//i.test(facility.website) ? facility.website : undefined
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`

  return (
    <div className="min-w-48 space-y-1.5 text-xs text-ink">
      <p className="text-sm font-semibold">{facility.name}</p>
      <p className="font-medium" style={{ color: KIND_COLORS[facility.kind] }}>
        {FACILITY_KIND_LABELS[facility.kind]}
      </p>
      {facility.address && <p>{facility.address}</p>}
      {phone && phoneHref && (
        <p>
          Phone:{' '}
          <a href={`tel:${phoneHref}`} className="font-medium text-royal underline">
            {phone}
          </a>
        </p>
      )}
      {facility.openingHours && <p>Hours: {facility.openingHours}</p>}
      <p className="flex gap-3 pt-0.5">
        <a href={directions} target="_blank" rel="noreferrer" className="font-medium text-royal underline">
          Directions
        </a>
        {website && (
          <a href={website} target="_blank" rel="noreferrer" className="font-medium text-royal underline">
            Website
          </a>
        )}
      </p>
      <p className="text-[11px] text-navy/70">Call to confirm services, hours and cost before you go.</p>
    </div>
  )
}

interface FacilityMarkerProps {
  facility: NearbyFacility
  focus: { id: string } | null
  onSelect: (id: string) => void
}

function FacilityMarker({ facility, focus, onSelect }: FacilityMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null)
  const focused = focus?.id === facility.id

  useEffect(() => {
    if (focused) markerRef.current?.openPopup()
  }, [focused, focus])

  return (
    <Marker
      ref={markerRef}
      position={[facility.lat, facility.lon]}
      icon={PIN_ICONS[facility.kind]}
      eventHandlers={{ click: () => onSelect(facility.id) }}
    >
      <Popup>
        <FacilityDetails facility={facility} />
      </Popup>
    </Marker>
  )
}

/* ----------------------------- Page ----------------------------- */

interface UserPosition extends LatLon {
  accuracy: number
}

const controlClass =
  'h-9 rounded-xl border border-cornflower/40 bg-white px-3 text-sm font-medium text-navy shadow-xs transition hover:bg-cornflower/10 focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60'

export default function FacilityMap() {
  const [searchCenter, setSearchCenter] = useState<LatLon>(DEFAULT_CENTER)
  const [viewCenter, setViewCenter] = useState<LatLon>(DEFAULT_CENTER)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [radiusKm, setRadiusKm] = useState<number>(5)
  const [filter, setFilter] = useState<KindFilter>('all')
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const [focus, setFocus] = useState<{ id: string } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  const { facilities, loading, failed, retry } = useNearbyFacilities(
    searchCenter.lat,
    searchCenter.lon,
    radiusKm,
  )

  const visible = filter === 'all' ? facilities : facilities.filter((item) => item.kind === filter)
  const countFor = (value: KindFilter) =>
    value === 'all' ? facilities.length : facilities.filter((item) => item.kind === value).length

  const movedAway = distanceKm(viewCenter, searchCenter) > radiusKm * 0.25

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Location is not available on this device.')
      return
    }
    setLocating(true)
    setLocationError('')
    // One-time lookup only. The position is not stored or tracked.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lon: position.coords.longitude }
        setUserPosition({ ...point, accuracy: position.coords.accuracy })
        setSearchCenter(point)
        setViewCenter(point)
        setFocus(null)
        setFlyTarget({ center: point, radiusKm })
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. You can still move the map and search that area.'
            : 'Could not get your location. Try again.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const changeRadius = (value: number) => {
    setRadiusKm(value)
    setFlyTarget({ center: searchCenter, radiusKm: value })
  }

  const searchThisArea = () => {
    setSearchCenter(viewCenter)
    setFocus(null)
  }

  const selectFacility = (facility: NearbyFacility) => {
    setFocus({ id: facility.id })
    setFlyTarget({ center: facility, zoom: 16 })
  }

  return (
    <main className="flex h-dvh flex-col bg-white lg:flex-row">
      {/* Map */}
      <div className="relative order-1 min-h-0 flex-1 lg:order-2">
        <MapContainer
          center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lon]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <FlyTo target={flyTarget} />
          <ViewTracker onMove={setViewCenter} />

          <Circle
            center={[searchCenter.lat, searchCenter.lon]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#2b6ad0',
              weight: 1.5,
              dashArray: '6 6',
              fillColor: '#68a4f1',
              fillOpacity: 0.06,
            }}
            interactive={false}
          />

          {userPosition && (
            <CircleMarker
              center={[userPosition.lat, userPosition.lon]}
              radius={8}
              pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2b6ad0', fillOpacity: 1 }}
            >
              <Popup>You are here (accuracy about {Math.round(userPosition.accuracy)} m)</Popup>
            </CircleMarker>
          )}

          {visible.map((facility) => (
            <FacilityMarker
              key={facility.id}
              facility={facility}
              focus={focus}
              onSelect={(id) => setFocus({ id })}
            />
          ))}
        </MapContainer>

        {movedAway && (
          <button
            type="button"
            onClick={searchThisArea}
            className="absolute top-3 left-1/2 z-1000 -translate-x-1/2 rounded-full bg-linear-to-b from-royal to-navy px-4 py-2 text-sm font-medium text-white shadow-lg shadow-navy/30 transition hover:from-royal hover:to-ink focus-visible:ring-4 focus-visible:ring-cornflower/50 focus-visible:outline-none"
          >
            Search this area
          </button>
        )}
      </div>

      {/* List and controls */}
      <aside className="order-2 flex max-h-[45%] min-h-0 flex-col border-t border-cornflower/30 lg:order-1 lg:max-h-none lg:w-96 lg:border-t-0 lg:border-r">
        <div className="space-y-3 border-b border-cornflower/20 p-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink">Nearby care</h1>
            <p className="text-xs text-navy/70">Hospitals and animal bite centers from OpenStreetMap.</p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={locateMe} disabled={locating} className={`${controlClass} flex-1`}>
              {locating ? 'Locating...' : 'Use my location'}
            </button>
            <select
              aria-label="Search radius"
              value={radiusKm}
              onChange={(event) => changeRadius(Number(event.target.value))}
              className={controlClass}
            >
              {RADIUS_OPTIONS_KM.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </div>

          {locationError && (
            <p role="alert" className="text-xs text-red-600">
              {locationError}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
            {FILTERS.map(({ value, label }) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(value)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none ${
                    active
                      ? 'border-royal bg-royal text-white'
                      : 'border-cornflower/40 bg-white text-navy hover:bg-cornflower/10'
                  }`}
                >
                  {value !== 'all' && (
                    <span
                      className="h-2 w-2 rounded-full ring-1 ring-white"
                      style={{ backgroundColor: KIND_COLORS[value] }}
                    />
                  )}
                  {label} ({countFor(value)})
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {loading && <p className="p-4 text-xs text-navy/70">Searching OpenStreetMap...</p>}

          {failed && (
            <p role="alert" className="p-4 text-xs text-red-600">
              Could not load facilities. The map service may be busy.{' '}
              <button type="button" onClick={retry} className="font-medium underline">
                Try again
              </button>
            </p>
          )}

          {!loading && !failed && visible.length === 0 && (
            <p className="p-4 text-xs text-navy/70">
              No facilities found within {radiusKm} km. Try a larger radius or another area. This does not
              mean there is no care nearby, because the map data can be incomplete.
            </p>
          )}

          <ul className="divide-y divide-cornflower/15">
            {visible.map((facility) => (
              <li key={facility.id}>
                <button
                  type="button"
                  onClick={() => selectFacility(facility)}
                  aria-current={focus?.id === facility.id}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-cornflower/10 focus-visible:bg-cornflower/10 focus-visible:outline-none ${
                    focus?.id === facility.id ? 'bg-cornflower/15' : ''
                  }`}
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: KIND_COLORS[facility.kind] }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{facility.name}</span>
                    <span className="block text-xs text-navy/70">
                      {FACILITY_KIND_LABELS[facility.kind]} - {facility.distanceKm.toFixed(1)} km
                    </span>
                    {facility.address && (
                      <span className="block truncate text-xs text-navy/60">{facility.address}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="border-t border-cornflower/20 p-3 text-[11px] leading-snug text-navy/70">
          Data from OpenStreetMap contributors may be incomplete or out of date. Distances are measured from
          the center of the search circle. Call the facility to confirm services, hours and cost before you
          travel.
        </p>
      </aside>
    </main>
  )
}
