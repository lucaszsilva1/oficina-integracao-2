import { z } from 'zod'

const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT'])

export const saveAttendancesSchema = z.array(
  z.object({
    studentId: z.string().min(1, 'studentId obrigatório'),
    status: attendanceStatusSchema,
  }),
)

export const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema,
})
