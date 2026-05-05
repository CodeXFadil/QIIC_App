import { NextResponse } from 'next/server'
import { signToken, COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const validEmail = process.env.ADMIN_EMAIL ?? 'admin@qiic.com'
  const validPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({ email, role: 'admin' })

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
