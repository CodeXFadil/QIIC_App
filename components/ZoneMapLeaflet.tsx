'use client'

import { useEffect, useRef } from 'react'

type Zone = {
  id: number
  name: string
  code: string
  memberCount: number
  latitude:  number | null
  longitude: number | null
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

export default function ZoneMapLeaflet({ zones }: { zones: Zone[] }) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const max = Math.max(...zones.map((z) => z.memberCount), 1)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Load Leaflet CSS once
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [25.3, 51.2],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: true,
      })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const zonesWithCoords  = zones.filter((z) => z.latitude && z.longitude)
      const zonesWithout     = zones.filter((z) => !z.latitude || !z.longitude)

      // Draw fixed-size circles — color only shows intensity, no size scaling
      zonesWithCoords.forEach((zone) => {
        const color  = getColor(zone.memberCount, max)
        // Fixed radius: 3 km for all zones — no overlap
        const radius = 3000

        const circle = L.circle([zone.latitude!, zone.longitude!], {
          color,
          fillColor: color,
          fillOpacity: 0.75,
          weight: 1.5,
          radius,
        }).addTo(map)

        const pct = max > 0 ? ((zone.memberCount / zones.reduce((s,z)=>s+z.memberCount,0))*100).toFixed(1) : '0'

        circle.bindPopup(`
          <div style="font-family:sans-serif;min-width:150px;padding:2px">
            <div style="font-weight:700;font-size:14px;color:#111">${zone.name}</div>
            <div style="margin-top:6px;font-size:13px;color:#374151">
              <strong style="font-size:18px">${zone.memberCount.toLocaleString()}</strong> members
            </div>
            <div style="margin-top:2px;font-size:11px;color:#6b7280">${pct}% of total · ${zone.code}</div>
          </div>`, { closeButton: false })

        circle.on('mouseover', () => circle.openPopup())
        circle.on('mouseout',  () => circle.closePopup())
      })

      // Warning panel for zones missing coordinates
      if (zonesWithout.length > 0) {
        const names = zonesWithout.map(z => z.name).join(', ')
        const info = L.control({ position: 'bottomleft' })
        info.onAdd = () => {
          const div = L.DomUtil.create('div')
          div.innerHTML = `
            <div style="background:white;padding:6px 10px;border-radius:8px;font-size:11px;
                        color:#92400e;border:1px solid #fde68a;max-width:220px;line-height:1.4">
              ⚠️ No coordinates: <strong>${names}</strong><br>
              <span style="color:#9ca3af">Set lat/lng in Manage Zones</span>
            </div>`
          return div
        }
        info.addTo(map)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Qatar Zone Map</h2>
      <div ref={mapRef} className="rounded-xl overflow-hidden w-full" style={{ height: '520px' }} />
      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Members:</span>
        {[
          { color: '#8ed0ae', label: 'Low'    },
          { color: '#2d9e6a', label: 'Medium' },
          { color: '#155e3e', label: 'High'   },
          { color: '#0d3d28', label: 'Top'    },
          { color: '#94a3b8', label: 'None'   },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-2">· Hover a circle for details</span>
      </div>
    </div>
  )
}
