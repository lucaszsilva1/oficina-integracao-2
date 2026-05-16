import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { updateAttendanceSchema } from '@/modules/attendances/attendance.schema'
import { updateAttendance } from '@/modules/attendances/attendance.service'

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticate(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = updateAttendanceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await updateAttendance(params.id, parsed.data.status, payload)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[ATTENDANCES ERROR]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
