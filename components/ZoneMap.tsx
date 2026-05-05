'use client'

import { useState } from 'react'

type Zone = {
  id: number
  name: string
  code: string
  memberCount: number
}

type ZoneLayout = {
  code: string
  x: number  // % from left
  y: number  // % from top
  w: number  // % width
  h: number  // % height
}

// Approximate Qatar geography layout
const LAYOUT: ZoneLayout[] = [
  { code: 'SHM', x: 30,  y: 2,  w: 26, h: 14 },
  { code: 'THK', x: 58,  y: 2,  w: 18, h: 12 },
  { code: 'KHR', x: 44,  y: 16, w: 16, h: 16 },
  { code: 'UMS', x: 27,  y: 21, w: 16, h: 12 },
  { code: 'KHS', x: 47,  y: 21, w: 13, h: 11 },
  { code: 'DKH', x: 2,   y: 30, w: 14, h: 16 },
  { code: 'RYN', x: 17,  y: 28, w: 24, h: 22 },
  { code: 'LUS', x: 41,  y: 33, w: 13, h: 13 },
  { code: 'WBY', x: 41,  y: 46, w: 13, h: 12 },
  { code: 'PRL', x: 56,  y: 31, w: 14, h: 12 },
  { code: 'MUT', x: 17,  y: 50, w: 12, h: 12 },
  { code: 'AKH', x: 29,  y: 50, w: 14, h: 12 },
  { code: 'DOH', x: 43,  y: 58, w: 26, h: 24 },
  { code: 'IND', x: 27,  y: 62, w: 24, h: 18 },
  { code: 'ABH', x: 55,  y: 58, w: 14, h: 14 }, // overlaps handled by DOH being on top
  { code: 'ANK', x: 33,  y: 80, w: 14, h: 11 },
  { code: 'WKR', x: 51,  y: 80, w: 17, h: 13 },
]

function getColor(count: number, max: number): string {
  if (count === 0) return '#dde9e2'
  const pct = count / max
  if (pct > 0.85) return '#0d3d28'
  if (pct > 0.65) return '#155e3e'
  if (pct > 0.45) return '#1e7c52'
  if (pct > 0.25) return '#2d9e6a'
  if (pct > 0.10) return '#5ab88a'
  return '#8ed0ae'
}

function getTextColor(count: number, max: number): string {
  if (count === 0) return '#5a7a68'
  const pct = count / max
  return pct > 0.25 ? '#ffffff' : '#1a3d2b'
}

export default function ZoneMap({ zones }: { zones: Zone[] }) {
  const [tooltip, setTooltip] = useState<{ zone: Zone; x: number; y: number } | null>(null)

  const byCode = Object.fromEntries(zones.map((z) => [z.code, z]))
  const max = Math.max(...zones.map((z) => z.memberCount), 1)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Qatar Zone Map</h2>
      <div
        className="relative w-full bg-gray-50 rounded-xl overflow-hidden"
        style={{ paddingBottom: '95%' }}
      >
        <div className="absolute inset-0 p-2">
          {LAYOUT.map((cell) => {
            const zone = byCode[cell.code]
            if (!zone) return null
            const count = zone.memberCount
            const bg = getColor(count, max)
            const fg = getTextColor(count, max)

            return (
              <div
                key={cell.code}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.closest('.relative')!.getBoundingClientRect()
                  const el = e.currentTarget.getBoundingClientRect()
                  setTooltip({
                    zone,
                    x: el.left - rect.left + el.width / 2,
                    y: el.top - rect.top,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
                className="absolute rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 hover:z-10 select-none"
                style={{
                  left: `${cell.x}%`,
                  top: `${cell.y}%`,
                  width: `${cell.w}%`,
                  height: `${cell.h}%`,
                  backgroundColor: bg,
                  border: '2px solid rgba(255,255,255,0.6)',
                }}
              >
                <span
                  className="font-semibold leading-tight text-center px-1"
                  style={{
                    color: fg,
                    fontSize: 'clamp(7px, 1.2vw, 13px)',
                  }}
                >
                  {zone.name}
                </span>
                <span
                  className="font-bold leading-none mt-0.5"
                  style={{
                    color: fg,
                    fontSize: 'clamp(8px, 1.4vw, 15px)',
                  }}
                >
                  {count > 0 ? count.toLocaleString() : '—'}
                </span>
              </div>
            )
          })}

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y - 8,
                transform: 'translate(-50%, -100%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div className="font-semibold">{tooltip.zone.name}</div>
              <div className="text-gray-300">
                {tooltip.zone.memberCount > 0
                  ? `${tooltip.zone.memberCount.toLocaleString()} members`
                  : 'No members'}
              </div>
              <div className="text-gray-400 text-[10px]">{tooltip.zone.code}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
