import { z } from 'zod'
import { createCertificateSchema } from './certificate.schema'

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>

export type PresenceWithCertificate = {
  attendanceId: string
  studentName: string
  certificate: { id: string; number: string; issuedAt: Date } | null
}
