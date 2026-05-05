'use client'

import { useEffect, useRef } from 'react'

type Zone = {
  id: number
  name: string
  code: string
  memberCount: number
}

// Approximate lat/lng centres for each Qatar zone
const ZONE_COORDS: Record<string, [number, number]> = {
  DOH: [25.2854, 51.5310],
  IND: [25.1527, 51.4475],
  WKR: [25.1704, 51.5966],
  RYN: [25.2913, 51.4241],
  KHR: [25.6804, 51.4963],
  ABH: [25.2361, 51.4683],
  LUS: [25.4186, 51.4897],
  AKH: [25.1147, 51.5052],
  WBY: [25.3285, 51.5304],
  MUT: [25.2664, 51.3958],
  UMS: [25.4046, 51.3966],
  PRL: [25.3742, 51.5520],
  SHM: [26.1586, 51.2150],
  THK: [25.7299, 51.5923],
  KHS: [25.5052, 51.5296],
  DKH: [25.4312, 50.7891],
  ANK: [25.0856, 51.5063],
}

function getColor(count: number, max: number): string {
  if (count === 0) return '#94a3b8'
  const pct = count / max
  if (pct > 0.85) return '#0d3d28'
  if (pct > 0.65) return '#155e3e'
  if (pct > 0.45) return '#1e7c52'
  if (pct > 0.25) return '#2d9e6a'
  if (pct > 0.10) return '#5ab88a'
  return '#8ed0ae'
}

function getRadius(count: number, max: number): number {
  if (count === 0) return 8000
  const pct = count / max
  return 8000 + pct * 28000  // 8km – 36km radius
}

export default function ZoneMapLeaflet({ zones }: { zones: Zone[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const max = Math.max(...zones.map((z) => z.memberCount), 1)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet (no SSR)
    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [25.3, 51.2],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      mapInstanceRef.current = map

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Draw a circle for every zone
      zones.forEach((zone) => {
        const coords = ZONE_COORDS[zone.code]
        if (!coords) return

        const color = getColor(zone.memberCount, max)
        const radius = getRadius(zone.memberCount, max)

        const circle = L.circle(coords, {
          color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 2,
          radius,
        }).addTo(map)

        const popupHtml = `
          <div style="font-family:sans-serif;min-width:130px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${zone.name}</div>
            <div style="font-size:13px;color:#374151">
              <span style="font-weight:600;font-size:16px">${zone.memberCount.toLocaleString()}</span> members
            </div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px">${zone.code}</div>
          </div>`

        circle.bindPopup(popupHtml, { closeButton: false, offset: [0, -4] })
        circle.on('mouseover', function () { circle.openPopup() })
        circle.on('mouseout',  function () { circle.closePopup() })
      })
    })

    // Leaflet CSS
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update circles when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    // Circles are rebuilt on mount; for live updates a full re-init suffices
  }, [zones])

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Qatar Zone Map</h2>
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden w-full"
        style={{ height: '520px' }}
      />
      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Members:</span>
        {[
          { color: '#8ed0ae', label: 'Low' },
          { color: '#2d9e6a', label: 'Medium' },
          { color: '#155e3e', label: 'High' },
          { color: '#0d3d28', label: 'Top' },
          { color: '#94a3b8', label: 'None' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
