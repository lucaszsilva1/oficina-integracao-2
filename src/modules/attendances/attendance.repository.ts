import { prisma } from '@/lib/prisma'
import type { AttendanceStatus } from './attendance.types'

export async function findWorkshopWithAttendances(workshopId: string) {
  return prisma.workshop.findUnique({
    where: { id: workshopId },
    include: {
      attendances: {
        include: { student: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function upsertAttendances(
  workshopId: string,
  items: { studentId: string; status: AttendanceStatus }[],
): Promise<void> {
  await prisma.$transaction(
    items.map(({ studentId, status }) =>
      prisma.attendance.upsert({
        where: { workshopId_studentId: { workshopId, studentId } },
        create: { workshopId, studentId, status },
        update: { status },
      }),
    ),
  )
}

export async function findAttendanceById(attendanceId: string) {
  return prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { workshop: true },
  })
}

export async function updateAttendanceStatus(attendanceId: string, status: AttendanceStatus) {
  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { status },
  })
}
