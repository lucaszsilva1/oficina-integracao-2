import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { findWorkshopWithAttendances } from '@/modules/attendances/attendance.repository'
import { AttendanceManager } from '@/components/attendances/attendance-manager'
import type { AttendanceWithStudent } from '@/modules/attendances/attendance.types'

type Props = {
  params: { id: string }
}

export default async function AttendancePage({ params }: Props) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) notFound()

  const payload = await verifyToken(token).catch(() => null)
  if (!payload) notFound()

  const workshop = await findWorkshopWithAttendances(params.id)
  if (!workshop) notFound()

  const canSave =
    payload.role === 'ADMIN' ||
    payload.role === 'TUTOR' ||
    (payload.role === 'PROFESSOR' && workshop.professorId === payload.id)

  if (!canSave) notFound()

  return (
    <main>
      <AttendanceManager
        workshop={{ id: workshop.id, title: workshop.title }}
        initialAttendances={workshop.attendances as AttendanceWithStudent[]}
      />
    </main>
  )
}
