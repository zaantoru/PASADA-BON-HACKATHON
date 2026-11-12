import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MapPinOff, RefreshCw } from 'lucide-react'

function FitWatcher() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

export function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], zoom ?? Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [lat, lng, zoom, map])
  return null
}

/**
 * Leaflet map with OSM-based light tiles and a recoverable error state.
 * The list next to the map remains usable if tiles fail to load.
 */
export function MapBase({
  center,
  zoom = 12,
  children,
  label,
  className = '',
}: {
  center: { lat: number; lng: number }
  zoom?: number
  children?: ReactNode
  label: string
  className?: string
}) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)
  const errors = useRef(0)
  const loaded = useRef(0)

  return (
    <div className={`relative isolate overflow-hidden ${className}`} role="region" aria-label={label}>
      <MapContainer
        key={attempt}
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="size-full"
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          eventHandlers={{
            tileerror: () => {
              errors.current++
              if (errors.current >= 6 && loaded.current === 0) setFailed(true)
            },
            tileload: () => {
              loaded.current++
            },
          }}
        />
        <FitWatcher />
        {children}
      </MapContainer>
      {failed && (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-pale/95 p-6 text-center">
          <div>
            <MapPinOff className="mx-auto size-9 text-royal" aria-hidden />
            <p className="mt-2 font-bold text-navy">The map couldn't load</p>
            <p className="mt-1 text-sm text-ink/70">Check your connection. The list below still works.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm mt-4 min-h-11 rounded-full px-5"
              onClick={() => {
                errors.current = 0
                loaded.current = 0
                setFailed(false)
                setAttempt((a) => a + 1)
              }}
            >
              <RefreshCw className="size-4" aria-hidden />
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
