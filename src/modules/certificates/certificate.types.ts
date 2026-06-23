import { z } from 'zod'
import { createCertificateSchema } from './certificate.schema'

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>

export type PresenceWithCertificate = {
  attendanceId: string
  studentName: string
  certificate: { id: string; number: string; issuedAt: Date } | null
}

export type CertificatePrintData = {
  number: string
  issuedAt: Date
  studentName: string
  workshopTitle: string
  themeName: string
  workshopDate: Date
  totalClasses: number
  professorName: string
}
