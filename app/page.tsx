import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/StatsCards'
import ZoneMap from '@/components/ZoneMap'
import ZoneRankings from '@/components/ZoneRankings'

export const revalidate = 30 // revalidate every 30s

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
            <ZoneMap zones={zones} />
          </div>
          <div className="lg:col-span-2">
            <ZoneRankings zones={zones} />
          </div>
        </div>
      </main>
    </div>
  )
}
