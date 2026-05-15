import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { updateWorkshopSchema } from '@/modules/workshops/workshop.schema'
import { updateWorkshop, deleteWorkshop } from '@/modules/workshops/workshop.service'
import { findById } from '@/modules/workshops/workshop.repository'

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
    const workshop = await findById(params.id)
    if (!workshop) {
      return NextResponse.json({ error: 'Oficina não encontrada' }, { status: 404 })
    }
    return NextResponse.json(workshop)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[WORKSHOPS ERROR]', error)
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
    const parsed = updateWorkshopSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const workshop = await updateWorkshop(params.id, parsed.data, payload)
    return NextResponse.json(workshop)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[WORKSHOPS ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!['PROFESSOR', 'ADMIN'].includes(payload.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    await deleteWorkshop(params.id, payload)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[WORKSHOPS ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
