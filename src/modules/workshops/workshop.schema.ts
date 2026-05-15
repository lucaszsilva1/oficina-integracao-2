import { z } from 'zod'

export const createWorkshopSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  date: z.coerce.date({ required_error: 'Data obrigatória' }),
  location: z.string().min(1, 'Local obrigatório'),
  themeId: z.string().min(1, 'Tema obrigatório'),
})

export const updateWorkshopSchema = z.object({
  title: z.string().min(1, 'Título não pode ser vazio').optional(),
  date: z.coerce.date().optional(),
  location: z.string().min(1, 'Local não pode ser vazio').optional(),
  themeId: z.string().min(1).optional(),
})
