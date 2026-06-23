import { prisma } from '@/lib/prisma'

export async function findAttendanceWithCertificate(attendanceId: string) {
  return prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: {
      certificate: true,
      workshop: { select: { id: true, professorId: true, totalClasses: true } },
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

export async function findCertificateForPrint(certificateId: string) {
  return prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      attendance: {
        include: {
          student: { select: { name: true } },
          workshop: {
            select: {
              title: true,
              date: true,
              totalClasses: true,
              theme: { select: { name: true } },
              professor: { select: { name: true } },
            },
          },
        },
      },
    },
  })
}

export async function createCertificate(data: { attendanceId: string; number: string }) {
  return prisma.certificate.create({ data })
}

export async function deleteCertificate(certificateId: string) {
  return prisma.certificate.delete({ where: { id: certificateId } })
}
