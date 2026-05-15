import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { createThemeSchema } from '@/modules/themes/theme.schema'
import { listThemes, createTheme } from '@/modules/themes/theme.service'

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const themes = await listThemes()
    return NextResponse.json(themes)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[THEMES ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!['PROFESSOR', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const parsed = createThemeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const theme = await createTheme(parsed.data)
    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[THEMES ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
