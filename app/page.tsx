import dynamic from 'next/dynamic'
import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/StatsCards'
import ZoneRankings from '@/components/ZoneRankings'

export const revalidate = 30

// Leaflet must be loaded client-side only (no SSR)
const ZoneMapLeaflet = dynamic(() => import('@/components/ZoneMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center"
      style={{ height: 600 }}
    >
      <div className="text-gray-400 text-sm animate-pulse">Loading map…</div>
    </div>
  ),
})

async function getZones() {
  return prisma.zone.findMany({ orderBy: { memberCount: 'desc' } })
}

export default async function HomePage() {
  const zones = await getZones()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zone Distribution</h1>
          <p className="text-gray-500 mt-1">Member distribution across Qatar zones</p>
        </div>

        {/* Stats */}
        <StatsCards zones={zones} />

        {/* Map + Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ZoneMapLeaflet zones={zones} />
          </div>
          <div className="lg:col-span-2">
            <ZoneRankings zones={zones} />
          </div>
        </div>
      </main>
    </div>
  )
}
