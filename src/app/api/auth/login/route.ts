import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail } from '@/modules/users/user.repository'
import { comparePassword, signToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const INVALID_CREDENTIALS = 'Credenciais inválidas'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { email, password } = parsed.data
    const user = await findUserByEmail(email)

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
    }

    const token = await signToken({ id: user.id, email: user.email, role: user.role })

    const response = NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 200 },
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
