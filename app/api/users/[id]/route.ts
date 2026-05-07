import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: { id: string } }

// PUT update user (admin only)
export async function PUT(req: Request, { params }: Params) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const id = parseInt(params.id)
  const { name, role, password } = await req.json()

  const data: Record<string, unknown> = {}
  if (name !== undefined)  data.name = name?.trim() || null
  if (role === 'admin' || role === 'viewer') data.role = role
  if (password) data.passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  return NextResponse.json(user)
}

// DELETE user (admin only, cannot delete yourself)
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const id = parseInt(params.id)
  // Prevent self-deletion
  const me = await prisma.user.findUnique({ where: { email: session.email as string } })
  if (me?.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
