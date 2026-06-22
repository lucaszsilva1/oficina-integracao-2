import { NotFoundError, ForbiddenError } from '@/lib/errors'
import {
  findWorkshopWithAttendances,
  upsertAttendances,
  findAttendanceById,
  updateAttendanceStatus,
} from './attendance.repository'
import type { AttendanceStatus, AttendanceWithStudent } from './attendance.types'

type Actor = { id: string; role: 'PROFESSOR' | 'TUTOR' | 'ADMIN' }

// Ponte status→presentCount enquanto não há UI de contagem por aula (Sprint 2):
// PRESENT registra frequência cheia (elegível ao certificado), ABSENT zera.
function presentCountFor(status: AttendanceStatus, totalClasses: number): number {
  return status === 'PRESENT' ? totalClasses : 0
}

export async function listAttendances(workshopId: string): Promise<AttendanceWithStudent[]> {
  const workshop = await findWorkshopWithAttendances(workshopId)
  if (!workshop) throw new NotFoundError('Oficina')
  return workshop.attendances as AttendanceWithStudent[]
}

export async function saveAttendances(
  workshopId: string,
  items: { studentId: string; status: AttendanceStatus }[],
  actor: Actor,
): Promise<void> {
  const workshop = await findWorkshopWithAttendances(workshopId)
  if (!workshop) throw new NotFoundError('Oficina')

  if (actor.role === 'PROFESSOR' && workshop.professorId !== actor.id) {
    throw new ForbiddenError('Você não tem permissão para registrar presença nesta oficina')
  }

  const enriched = items.map((item) => ({
    ...item,
    presentCount: presentCountFor(item.status, workshop.totalClasses),
  }))

  await upsertAttendances(workshopId, enriched)
}

export async function updateAttendance(
  attendanceId: string,
  status: AttendanceStatus,
  actor: Actor,
): Promise<void> {
  const attendance = await findAttendanceById(attendanceId)
  if (!attendance) throw new NotFoundError('Presença')

  if (actor.role === 'PROFESSOR' && attendance.workshop.professorId !== actor.id) {
    throw new ForbiddenError('Você não tem permissão para editar esta presença')
  }

  const presentCount = presentCountFor(status, attendance.workshop.totalClasses)
  await updateAttendanceStatus(attendanceId, status, presentCount)
}
