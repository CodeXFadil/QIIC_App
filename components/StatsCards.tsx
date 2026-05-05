type Zone = { memberCount: number; name: string }

function Card({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <span className="text-2xl opacity-60">{icon}</span>
    </div>
  )
}

export default function StatsCards({ zones }: { zones: Zone[] }) {
  const total = zones.reduce((s, z) => s + z.memberCount, 0)
  const active = zones.filter((z) => z.memberCount > 0).length
  const top = [...zones].sort((a, b) => b.memberCount - a.memberCount)[0]
  const avg = active > 0 ? Math.round(total / active) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Total Members" value={total.toLocaleString()} icon="👥" />
      <Card label="Active Zones"  value={active}                  icon="📍" />
      <Card label="Top Zone"      value={top?.name ?? '—'}         icon="🏆" />
      <Card label="Avg per Zone"  value={avg.toLocaleString()}     icon="📈" />
    </div>
  )
}
