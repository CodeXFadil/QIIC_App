type Zone = { id: number; name: string; code: string; memberCount: number }

export default function ZoneRankings({ zones }: { zones: Zone[] }) {
  const total = zones.reduce((s, z) => s + z.memberCount, 0)
  const ranked = [...zones].sort((a, b) => b.memberCount - a.memberCount).slice(0, 10)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Zone Rankings</h2>
      <div className="space-y-3">
        {ranked.map((zone, i) => {
          const pct = total > 0 ? ((zone.memberCount / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={zone.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-6 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">{zone.name}</span>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {zone.memberCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400 font-medium">{zone.code}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-brand-600 font-semibold shrink-0">{pct}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
