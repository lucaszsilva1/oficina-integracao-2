import { z } from 'zod'

export const createThemeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
})

export const updateThemeSchema = z.object({
  name: z.string().min(1, 'Nome não pode ser vazio').optional(),
  description: z.string().optional(),
})
