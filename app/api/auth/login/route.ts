import { NextResponse } from 'next/server'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@qiic.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  const viewerEmail    = process.env.VIEWER_EMAIL    ?? 'viewer@qiic.com'
  const viewerPassword = process.env.VIEWER_PASSWORD ?? 'viewer123'

  let role: string | null = null
  if (email === adminEmail  && password === adminPassword)  role = 'admin'
  if (email === viewerEmail && password === viewerPassword) role = 'viewer'

  if (!role) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({ email, role })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return res
}
