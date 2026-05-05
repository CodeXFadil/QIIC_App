import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: { id: string } }

export async function PUT(req: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  const { name, code, memberCount } = await req.json()

  const zone = await prisma.zone.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(code && { code: code.trim().toUpperCase() }),
      memberCount: Number(memberCount) ?? 0,
    },
  })
  return NextResponse.json(zone)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.zone.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
