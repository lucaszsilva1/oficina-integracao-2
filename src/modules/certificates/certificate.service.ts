import crypto from 'crypto'
import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'
import {
  findAttendanceWithCertificate,
  findCertificatesByWorkshop,
  findCertificateById,
  findCertificateForPrint,
  createCertificate as createCertificateInDb,
  deleteCertificate as deleteCertificateInDb,
} from './certificate.repository'
import { prisma } from '@/lib/prisma'
import { isEligibleForCertificate } from './certificate.eligibility'
import type { PresenceWithCertificate, CertificatePrintData } from './certificate.types'

type Actor = { id: string; role: 'PROFESSOR' | 'TUTOR' | 'ADMIN' }

export async function createCertificate(attendanceId: string, actor: Actor) {
  const attendance = await findAttendanceWithCertificate(attendanceId)
  if (!attendance) throw new NotFoundError('Presença')

  if (attendance.status === 'ABSENT') {
    throw new ConflictError('Aluno não estava presente na oficina')
  }

  if (attendance.certificate !== null) {
    throw new ConflictError('Certificado já emitido para esta presença')
  }

  if (actor.role === 'TUTOR') {
    throw new ForbiddenError('Tutores não podem emitir certificados')
  }

  if (actor.role === 'PROFESSOR' && attendance.workshop.professorId !== actor.id) {
    throw new ForbiddenError('Você não tem permissão para emitir certificados nesta oficina')
  }

  if (!isEligibleForCertificate(attendance.presentCount, attendance.workshop.totalClasses)) {
    throw new ConflictError('Aluno não atingiu 75% de presença para emitir certificado')
  }

  const number = crypto.randomUUID()
  return createCertificateInDb({ attendanceId, number })
}

export async function listCertificates(workshopId: string): Promise<PresenceWithCertificate[]> {
  const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } })
  if (!workshop) throw new NotFoundError('Oficina')

  const presences = await findCertificatesByWorkshop(workshopId)
  return presences.map((p) => ({
    attendanceId: p.id,
    studentName: p.student.name,
    certificate: p.certificate,
  }))
}

export async function getCertificateForPrint(
  certificateId: string,
): Promise<CertificatePrintData> {
  const cert = await findCertificateForPrint(certificateId)
  if (!cert) throw new NotFoundError('Certificado')

  const { attendance } = cert
  return {
    number: cert.number,
    issuedAt: cert.issuedAt,
    studentName: attendance.student.name,
    workshopTitle: attendance.workshop.title,
    themeName: attendance.workshop.theme.name,
    workshopDate: attendance.workshop.date,
    totalClasses: attendance.workshop.totalClasses,
    professorName: attendance.workshop.professor.name,
  }
}

export async function deleteCertificate(certificateId: string, actor: Actor): Promise<void> {
  const certificate = await findCertificateById(certificateId)
  if (!certificate) throw new NotFoundError('Certificado')

  if (actor.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas administradores podem excluir certificados')
  }

  await deleteCertificateInDb(certificateId)
}
