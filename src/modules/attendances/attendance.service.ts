import { NotFoundError, ForbiddenError } from '@/lib/errors'
import {
  findWorkshopWithAttendances,
  upsertAttendances,
  findAttendanceById,
  updateAttendanceStatus,
} from './attendance.repository'
import type { AttendanceStatus, AttendanceWithStudent } from './attendance.types'

type Actor = { id: string; role: 'PROFESSOR' | 'TUTOR' | 'ADMIN' }

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

  await upsertAttendances(workshopId, items)
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

  await updateAttendanceStatus(attendanceId, status)
}
