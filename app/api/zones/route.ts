import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const zones = await prisma.zone.findMany({ orderBy: { memberCount: 'desc' } })
  return NextResponse.json(zones)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, code, memberCount, latitude, longitude } = await req.json()
  if (!name?.trim() || !code?.trim()) {
    return NextResponse.json({ error: 'Name and code are required' }, { status: 400 })
  }

  const zone = await prisma.zone.create({
    data: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      memberCount: Number(memberCount) || 0,
      latitude:  latitude  ? Number(latitude)  : null,
      longitude: longitude ? Number(longitude) : null,
    },
  })
  return NextResponse.json(zone, { status: 201 })
}
