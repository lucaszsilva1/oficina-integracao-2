import { z } from 'zod'

export const createCertificateSchema = z.object({
  attendanceId: z.string().min(1, 'attendanceId obrigatório'),
})
