import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTheme, listThemes, updateTheme } from '@/modules/themes/theme.service'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    theme: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  theme: {
    create: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const makeTheme = (overrides = {}) => ({
  id: 'theme-1',
  name: 'Introdução ao Scratch',
  slug: 'introducao-ao-scratch',
  description: 'Aprenda Scratch do zero',
  createdAt: new Date(),
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listThemes', () => {
  it('retorna array de temas', async () => {
    const themes = [makeTheme(), makeTheme({ id: 'theme-2', name: 'Lógica', slug: 'logica' })]
    mockPrisma.theme.findMany.mockResolvedValue(themes)

    const result = await listThemes()

    expect(result).toEqual(themes)
    expect(mockPrisma.theme.findMany).toHaveBeenCalledOnce()
  })

  it('retorna array vazio quando não há temas', async () => {
    mockPrisma.theme.findMany.mockResolvedValue([])

    const result = await listThemes()

    expect(result).toEqual([])
  })
})

describe('createTheme', () => {
  it('cria tema válido e retorna tema com slug gerado', async () => {
    const theme = makeTheme()
    mockPrisma.theme.findUnique.mockResolvedValue(null)
    mockPrisma.theme.create.mockResolvedValue(theme)

    const result = await createTheme({ name: 'Introdução ao Scratch', description: 'Aprenda Scratch do zero' })

    expect(result).toEqual(theme)
    expect(mockPrisma.theme.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'introducao-ao-scratch' }),
      }),
    )
  })

  it('gera slug correto para nomes com acentos e espaços', async () => {
    const theme = makeTheme({ name: 'Lógica de Programação', slug: 'logica-de-programacao' })
    mockPrisma.theme.findUnique.mockResolvedValue(null)
    mockPrisma.theme.create.mockResolvedValue(theme)

    await createTheme({ name: 'Lógica de Programação' })

    expect(mockPrisma.theme.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'logica-de-programacao' }),
      }),
    )
  })

  it('lança ValidationError quando nome é vazio', async () => {
    await expect(createTheme({ name: '' })).rejects.toThrow(ValidationError)
  })

  it('lança ConflictError quando slug já existe', async () => {
    mockPrisma.theme.findUnique.mockResolvedValue(makeTheme())

    await expect(createTheme({ name: 'Introdução ao Scratch' })).rejects.toThrow(ConflictError)
    expect(mockPrisma.theme.create).not.toHaveBeenCalled()
  })
})

describe('updateTheme', () => {
  it('atualiza tema existente com novo nome e retorna tema atualizado', async () => {
    const existing = makeTheme()
    const updated = makeTheme({ name: 'Scratch Avançado', slug: 'scratch-avancado' })
    mockPrisma.theme.findUnique
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null)
    mockPrisma.theme.update.mockResolvedValue(updated)

    const result = await updateTheme('theme-1', { name: 'Scratch Avançado' })

    expect(result).toEqual(updated)
    expect(mockPrisma.theme.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'theme-1' },
        data: expect.objectContaining({ slug: 'scratch-avancado' }),
      }),
    )
  })

  it('atualiza apenas a descrição sem alterar slug', async () => {
    const existing = makeTheme()
    const updated = makeTheme({ description: 'Nova descrição' })
    mockPrisma.theme.findUnique.mockResolvedValueOnce(existing)
    mockPrisma.theme.update.mockResolvedValue(updated)

    await updateTheme('theme-1', { description: 'Nova descrição' })

    expect(mockPrisma.theme.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ slug: expect.anything() }),
      }),
    )
  })

  it('lança NotFoundError quando tema não existe', async () => {
    mockPrisma.theme.findUnique.mockResolvedValue(null)

    await expect(updateTheme('id-inexistente', { name: 'Novo Nome' })).rejects.toThrow(NotFoundError)
    expect(mockPrisma.theme.update).not.toHaveBeenCalled()
  })

  it('lança ConflictError quando novo nome gera slug já existente em outro tema', async () => {
    const existing = makeTheme()
    const conflicting = makeTheme({ id: 'theme-2' })
    mockPrisma.theme.findUnique
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(conflicting)

    await expect(updateTheme('theme-1', { name: 'Introdução ao Scratch' })).rejects.toThrow(ConflictError)
    expect(mockPrisma.theme.update).not.toHaveBeenCalled()
  })
})
