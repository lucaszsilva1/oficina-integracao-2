import { z } from 'zod'
import { createStudentSchema, updateStudentSchema } from './student.schema'

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>

export type Student = {
  id: string
  name: string
  school: string | null
  age: number | null
  createdAt: Date
}
