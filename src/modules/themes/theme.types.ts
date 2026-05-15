import { z } from 'zod'
import { createThemeSchema, updateThemeSchema } from './theme.schema'

export type CreateThemeInput = z.infer<typeof createThemeSchema>
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>

export type Theme = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
}
