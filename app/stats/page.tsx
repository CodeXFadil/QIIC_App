import { prisma } from '@/lib/db'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/StatsCards'
import StatsCharts from '@/components/StatsCharts'

export const revalidate = 30

async function getZones() {
  return prisma.zone.findMany({ orderBy: { memberCount: 'desc' } })
}

export default async function StatsPage() {
  const zones = await getZones()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-500 mt-1">Detailed member analytics by zone</p>
        </div>

        {/* Stats Cards */}
        <StatsCards zones={zones} />

        {/* Charts */}
        <StatsCharts zones={zones} />
      </main>
    </div>
  )
}
