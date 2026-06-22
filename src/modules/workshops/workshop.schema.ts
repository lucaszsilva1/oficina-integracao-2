import { z } from 'zod'

const totalClassesSchema = z.coerce
  .number({ invalid_type_error: 'Número de aulas inválido' })
  .int('Número de aulas deve ser inteiro')
  .min(1, 'Número de aulas deve ser ao menos 1')
  .max(10, 'Número de aulas não pode exceder 10')

export const createWorkshopSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  date: z.coerce.date({ required_error: 'Data obrigatória' }),
  location: z.string().min(1, 'Local obrigatório'),
  themeId: z.string().min(1, 'Tema obrigatório'),
  totalClasses: totalClassesSchema.default(1),
})

export const updateWorkshopSchema = z.object({
  title: z.string().min(1, 'Título não pode ser vazio').optional(),
  date: z.coerce.date().optional(),
  location: z.string().min(1, 'Local não pode ser vazio').optional(),
  themeId: z.string().min(1).optional(),
  totalClasses: totalClassesSchema.optional(),
})
