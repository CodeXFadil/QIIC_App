'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

type Zone = { id: number; name: string; code: string; memberCount: number }

const PIE_COLORS = [
  '#124030', // darkest
  '#1a5c45',
  '#2d7a5a',
  '#4d9e7a',
  '#e08c3a', // orange accent (matches screenshot)
  '#7cbfa0',
  '#8ab5a0',
  '#a8d9c0',
]

// Custom label rendered outside the pie slice
function PieLabel({
  cx, cy, midAngle, outerRadius, name, percent,
}: {
  cx: number; cy: number; midAngle: number; outerRadius: number
  name: string; percent: number
}) {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 28
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.03) return null
  return (
    <text
      x={x} y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="fill-gray-600"
      style={{ fontSize: 11 }}
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
}

// Custom tooltip for bar chart
function BarTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <span className="font-bold">{payload[0].value.toLocaleString()}</span> members
    </div>
  )
}

// Custom tooltip for pie chart
function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percent: number } }[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <div className="font-semibold">{item.name}</div>
      <div className="text-gray-300">
        {item.value.toLocaleString()} members &middot; {(item.payload.percent * 100).toFixed(1)}%
      </div>
    </div>
  )
}

export default function StatsCharts({ zones }: { zones: Zone[] }) {
  const sorted = [...zones].sort((a, b) => b.memberCount - a.memberCount)
  const top8 = sorted.slice(0, 8).filter((z) => z.memberCount > 0)

  // Bar chart data — all zones with members, sorted desc
  const barData = sorted
    .filter((z) => z.memberCount > 0)
    .map((z) => ({ name: z.name, value: z.memberCount }))

  // Pie chart data — top 8
  const pieData = top8.map((z) => ({
    name: z.name,
    value: z.memberCount,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Bar Chart */}
      <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Members by Zone</h2>
        <ResponsiveContainer width="100%" height={barData.length * 36 + 20}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {barData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? '#0d3d28' : i === 1 ? '#1a5c45' : '#2d9e6a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Distribution (Top 8)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={PieLabel as never}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
