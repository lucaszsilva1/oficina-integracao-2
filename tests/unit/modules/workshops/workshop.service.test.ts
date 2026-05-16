import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listWorkshops, createWorkshop, updateWorkshop, deleteWorkshop } from '@/modules/workshops/workshop.service'
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workshop: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    theme: {
      findUnique: vi.fn(),
    },
    certificate: {
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  workshop: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  theme: {
    findUnique: ReturnType<typeof vi.fn>
  }
  certificate: {
    count: ReturnType<typeof vi.fn>
  }
}

const makeTheme = (overrides = {}) => ({
  id: 'theme-1',
  name: 'Scratch',
  slug: 'scratch',
  description: null,
  createdAt: new Date(),
  ...overrides,
})

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Prof Silva',
  email: 'silva@ellp.dev',
  role: 'PROFESSOR',
  ...overrides,
})

const makeWorkshop = (overrides = {}) => ({
  id: 'ws-1',
  title: 'Oficina de Scratch',
  date: new Date('2026-06-01'),
  location: 'Lab 1',
  themeId: 'theme-1',
  professorId: 'user-1',
  createdAt: new Date(),
  theme: makeTheme(),
  professor: makeUser(),
  ...overrides,
})

const professorPayload = { id: 'user-1', email: 'silva@ellp.dev', role: 'PROFESSOR' as const }
const adminPayload = { id: 'admin-1', email: 'admin@ellp.dev', role: 'ADMIN' as const }
const otherProfessor = { id: 'user-2', email: 'outro@ellp.dev', role: 'PROFESSOR' as const }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── listWorkshops ────────────────────────────────────────────────────────────

describe('listWorkshops', () => {
  it('retorna array de workshops com tema e professor', async () => {
    const workshops = [makeWorkshop(), makeWorkshop({ id: 'ws-2', title: 'Oficina 2' })]
    mockPrisma.workshop.findMany.mockResolvedValue(workshops)

    const result = await listWorkshops()

    expect(result).toEqual(workshops)
    expect(mockPrisma.workshop.findMany).toHaveBeenCalledOnce()
  })

  it('retorna array vazio quando não há workshops', async () => {
    mockPrisma.workshop.findMany.mockResolvedValue([])

    const result = await listWorkshops()

    expect(result).toEqual([])
  })
})

// ─── createWorkshop ───────────────────────────────────────────────────────────

describe('createWorkshop', () => {
  it('cria workshop válido associado ao professor logado', async () => {
    const workshop = makeWorkshop()
    mockPrisma.theme.findUnique.mockResolvedValue(makeTheme())
    mockPrisma.workshop.create.mockResolvedValue(workshop)

    const result = await createWorkshop(
      { title: 'Oficina de Scratch', date: new Date('2026-06-01'), location: 'Lab 1', themeId: 'theme-1' },
      professorPayload,
    )

    expect(result).toEqual(workshop)
    expect(mockPrisma.workshop.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ professorId: 'user-1' }),
      }),
    )
  })

  it('lança ValidationError se título está vazio', async () => {
    await expect(
      createWorkshop(
        { title: '', date: new Date('2026-06-01'), location: 'Lab 1', themeId: 'theme-1' },
        professorPayload,
      ),
    ).rejects.toThrow(ValidationError)
  })

  it('lança ValidationError se data está ausente', async () => {
    await expect(
      createWorkshop(
        { title: 'Oficina', date: null as unknown as Date, location: 'Lab 1', themeId: 'theme-1' },
        professorPayload,
      ),
    ).rejects.toThrow(ValidationError)
  })

  it('lança NotFoundError se themeId não existe', async () => {
    mockPrisma.theme.findUnique.mockResolvedValue(null)

    await expect(
      createWorkshop(
        { title: 'Oficina', date: new Date('2026-06-01'), location: 'Lab 1', themeId: 'theme-inexistente' },
        professorPayload,
      ),
    ).rejects.toThrow(NotFoundError)
    expect(mockPrisma.workshop.create).not.toHaveBeenCalled()
  })
})

// ─── updateWorkshop ───────────────────────────────────────────────────────────

describe('updateWorkshop', () => {
  it('atualiza workshop — professor dono', async () => {
    const existing = makeWorkshop()
    const updated = makeWorkshop({ title: 'Novo Título' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.workshop.update.mockResolvedValue(updated)

    const result = await updateWorkshop('ws-1', { title: 'Novo Título' }, professorPayload)

    expect(result).toEqual(updated)
    expect(mockPrisma.workshop.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ws-1' } }),
    )
  })

  it('atualiza workshop — admin pode editar qualquer workshop', async () => {
    const existing = makeWorkshop()
    const updated = makeWorkshop({ location: 'Lab 2' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.workshop.update.mockResolvedValue(updated)

    const result = await updateWorkshop('ws-1', { location: 'Lab 2' }, adminPayload)

    expect(result).toEqual(updated)
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(updateWorkshop('ws-inexistente', { title: 'X' }, professorPayload)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.workshop.update).not.toHaveBeenCalled()
  })

  it('lança ForbiddenError se professor tenta editar workshop de outro', async () => {
    const existing = makeWorkshop({ professorId: 'user-1' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)

    await expect(updateWorkshop('ws-1', { title: 'X' }, otherProfessor)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.workshop.update).not.toHaveBeenCalled()
  })
})

// ─── deleteWorkshop — ADMIN ───────────────────────────────────────────────────

describe('deleteWorkshop — ADMIN', () => {
  it('exclui workshop com attendances (cascade — banco resolve)', async () => {
    const existing = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.workshop.delete.mockResolvedValue(existing)

    await deleteWorkshop('ws-1', adminPayload)

    expect(mockPrisma.workshop.delete).toHaveBeenCalledWith({ where: { id: 'ws-1' } })
    expect(mockPrisma.certificate.count).not.toHaveBeenCalled()
  })

  it('exclui workshop sem attendances', async () => {
    const existing = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.workshop.delete.mockResolvedValue(existing)

    await deleteWorkshop('ws-1', adminPayload)

    expect(mockPrisma.workshop.delete).toHaveBeenCalledOnce()
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(deleteWorkshop('ws-inexistente', adminPayload)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.workshop.delete).not.toHaveBeenCalled()
  })
})

// ─── deleteWorkshop — PROFESSOR ───────────────────────────────────────────────

describe('deleteWorkshop — PROFESSOR', () => {
  it('exclui workshop próprio sem attendances', async () => {
    const existing = makeWorkshop({ professorId: 'user-1' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.certificate.count.mockResolvedValue(0)
    mockPrisma.workshop.delete.mockResolvedValue(existing)

    await deleteWorkshop('ws-1', professorPayload)

    expect(mockPrisma.workshop.delete).toHaveBeenCalledWith({ where: { id: 'ws-1' } })
  })

  it('exclui workshop próprio com attendances mas sem certificados', async () => {
    const existing = makeWorkshop({ professorId: 'user-1' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.certificate.count.mockResolvedValue(0)
    mockPrisma.workshop.delete.mockResolvedValue(existing)

    await deleteWorkshop('ws-1', professorPayload)

    expect(mockPrisma.workshop.delete).toHaveBeenCalledWith({ where: { id: 'ws-1' } })
  })

  it('lança ForbiddenError se workshop pertence a outro professor', async () => {
    const existing = makeWorkshop({ professorId: 'user-1' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)

    await expect(deleteWorkshop('ws-1', otherProfessor)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.workshop.delete).not.toHaveBeenCalled()
  })

  it('lança ConflictError se workshop tem certificados emitidos', async () => {
    const existing = makeWorkshop({ professorId: 'user-1' })
    mockPrisma.workshop.findUnique.mockResolvedValue(existing)
    mockPrisma.certificate.count.mockResolvedValue(2)

    await expect(deleteWorkshop('ws-1', professorPayload)).rejects.toThrow(ConflictError)
    expect(mockPrisma.workshop.delete).not.toHaveBeenCalled()
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(deleteWorkshop('ws-1', professorPayload)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.workshop.delete).not.toHaveBeenCalled()
  })
})
