import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const zones = await prisma.zone.findMany({ orderBy: { memberCount: 'desc' } })
  return NextResponse.json(zones)
}

// Zones are fixed — adding new zones is disabled
export async function POST() {
  return NextResponse.json({ error: 'Adding new zones is disabled' }, { status: 405 })
}
