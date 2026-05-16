import { z } from 'zod'

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  school: z.string().optional(),
  age: z.number().int().positive('Idade deve ser positiva').optional(),
})

export const updateStudentSchema = z.object({
  name: z.string().min(1, 'Nome não pode ser vazio').optional(),
  school: z.string().optional(),
  age: z.number().int().positive('Idade deve ser positiva').optional(),
})
