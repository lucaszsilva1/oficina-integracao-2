import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { createWorkshopSchema } from '@/modules/workshops/workshop.schema'
import { listWorkshops, createWorkshop } from '@/modules/workshops/workshop.service'

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
    const workshops = await listWorkshops()
    return NextResponse.json(workshops)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[WORKSHOPS ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (payload.role !== 'PROFESSOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const parsed = createWorkshopSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const workshop = await createWorkshop(parsed.data, payload)
    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[WORKSHOPS ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
