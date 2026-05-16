import { z } from 'zod'
import { saveAttendancesSchema, updateAttendanceSchema } from './attendance.schema'

export type SaveAttendancesInput = z.infer<typeof saveAttendancesSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>

export type AttendanceStatus = 'PRESENT' | 'ABSENT'

export type AttendanceWithStudent = {
  id: string
  workshopId: string
  studentId: string
  status: AttendanceStatus
  createdAt: Date
  student: {
    id: string
    name: string
    school: string | null
    age: number | null
  }
}

export type WorkshopWithAttendances = {
  id: string
  title: string
  date: Date
  location: string
  themeId: string
  professorId: string
  attendances: AttendanceWithStudent[]
}
