import { prisma } from '@/lib/prisma'

export async function findAttendanceWithCertificate(attendanceId: string) {
  return prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: {
      certificate: true,
      workshop: { select: { id: true, professorId: true } },
    },
  })
}

export async function findCertificatesByWorkshop(workshopId: string) {
  return prisma.attendance.findMany({
    where: { workshopId, status: 'PRESENT' },
    include: {
      student: { select: { id: true, name: true } },
      certificate: { select: { id: true, number: true, issuedAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function findCertificateById(certificateId: string) {
  return prisma.certificate.findUnique({ where: { id: certificateId } })
}

export async function createCertificate(data: { attendanceId: string; number: string }) {
  return prisma.certificate.create({ data })
}

export async function deleteCertificate(certificateId: string) {
  return prisma.certificate.delete({ where: { id: certificateId } })
}
