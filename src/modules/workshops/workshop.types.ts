import { z } from 'zod'
import { createWorkshopSchema, updateWorkshopSchema } from './workshop.schema'

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>

export type WorkshopUser = {
  id: string
  name: string
  email: string
  role: string
}

export type Workshop = {
  id: string
  title: string
  date: Date
  location: string
  themeId: string
  professorId: string
  createdAt: Date
  theme?: { id: string; name: string; slug: string }
  professor?: WorkshopUser
}
