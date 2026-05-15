import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { updateThemeSchema } from '@/modules/themes/theme.schema'
import { updateTheme } from '@/modules/themes/theme.service'
import { findById } from '@/modules/themes/theme.repository'

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const theme = await findById(params.id)
    if (!theme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }
    return NextResponse.json(theme)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[THEMES ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const parsed = updateThemeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const theme = await updateTheme(params.id, parsed.data)
    return NextResponse.json(theme)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[THEMES ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
