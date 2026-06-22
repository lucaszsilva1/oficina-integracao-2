import { describe, it, expect } from 'vitest'
import { createWorkshopSchema, updateWorkshopSchema } from '@/modules/workshops/workshop.schema'

const validBase = {
  title: 'Oficina de Scratch',
  date: '2026-06-01T10:00',
  location: 'Lab 1',
  themeId: 'theme-1',
}

describe('createWorkshopSchema — totalClasses', () => {
  it('aceita totalClasses dentro do intervalo (1 a 10)', () => {
    const parsed = createWorkshopSchema.safeParse({ ...validBase, totalClasses: 5 })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.totalClasses).toBe(5)
  })

  it('assume 1 quando totalClasses é omitido', () => {
    const parsed = createWorkshopSchema.safeParse(validBase)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.totalClasses).toBe(1)
  })

  it('aceita os limites 1 e 10', () => {
    expect(createWorkshopSchema.safeParse({ ...validBase, totalClasses: 1 }).success).toBe(true)
    expect(createWorkshopSchema.safeParse({ ...validBase, totalClasses: 10 }).success).toBe(true)
  })

  it('rejeita totalClasses abaixo de 1', () => {
    expect(createWorkshopSchema.safeParse({ ...validBase, totalClasses: 0 }).success).toBe(false)
  })

  it('rejeita totalClasses acima de 10', () => {
    expect(createWorkshopSchema.safeParse({ ...validBase, totalClasses: 11 }).success).toBe(false)
  })

  it('rejeita totalClasses não inteiro', () => {
    expect(createWorkshopSchema.safeParse({ ...validBase, totalClasses: 2.5 }).success).toBe(false)
  })
})

describe('updateWorkshopSchema — totalClasses', () => {
  it('aceita totalClasses ausente (campo opcional)', () => {
    expect(updateWorkshopSchema.safeParse({ title: 'Novo' }).success).toBe(true)
  })

  it('aceita totalClasses válido', () => {
    const parsed = updateWorkshopSchema.safeParse({ totalClasses: 8 })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.totalClasses).toBe(8)
  })

  it('rejeita totalClasses fora do intervalo', () => {
    expect(updateWorkshopSchema.safeParse({ totalClasses: 0 }).success).toBe(false)
    expect(updateWorkshopSchema.safeParse({ totalClasses: 11 }).success).toBe(false)
  })
})
