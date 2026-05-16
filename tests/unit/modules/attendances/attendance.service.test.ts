import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listAttendances,
  saveAttendances,
  updateAttendance,
} from '@/modules/attendances/attendance.service'
import { NotFoundError, ForbiddenError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workshop: {
      findUnique: vi.fn(),
    },
    attendance: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  workshop: { findUnique: ReturnType<typeof vi.fn> }
  attendance: {
    findUnique: ReturnType<typeof vi.fn>
    upsert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  $transaction: ReturnType<typeof vi.fn>
}

const makeStudent = (overrides = {}) => ({
  id: 'student-1',
  name: 'Ana Silva',
  school: 'Escola Estadual',
  age: 12,
  ...overrides,
})

const makeAttendance = (overrides = {}) => ({
  id: 'att-1',
  workshopId: 'workshop-1',
  studentId: 'student-1',
  status: 'PRESENT' as const,
  createdAt: new Date(),
  student: makeStudent(),
  ...overrides,
})

const makeWorkshop = (overrides = {}) => ({
  id: 'workshop-1',
  title: 'Oficina Scratch',
  date: new Date(),
  location: 'Sala 1',
  themeId: 'theme-1',
  professorId: 'prof-1',
  attendances: [],
  ...overrides,
})

const adminActor = { id: 'admin-1', role: 'ADMIN' as const }
const professorOwner = { id: 'prof-1', role: 'PROFESSOR' as const }
const professorOther = { id: 'prof-2', role: 'PROFESSOR' as const }
const tutorActor = { id: 'tutor-1', role: 'TUTOR' as const }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── listAttendances ──────────────────────────────────────────────────────────

describe('listAttendances', () => {
  it('retorna attendances existentes com student incluído', async () => {
    const att = makeAttendance()
    const workshop = makeWorkshop({ attendances: [att] })
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)

    const result = await listAttendances('workshop-1')

    expect(result).toEqual([att])
  })

  it('retorna array vazio quando não há registros', async () => {
    const workshop = makeWorkshop({ attendances: [] })
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)

    const result = await listAttendances('workshop-1')

    expect(result).toEqual([])
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(listAttendances('id-inexistente')).rejects.toThrow(NotFoundError)
  })
})

// ─── saveAttendances — autorização ───────────────────────────────────────────

describe('saveAttendances — autorização', () => {
  it('PROFESSOR dono salva em sua oficina', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    await expect(
      saveAttendances('workshop-1', [{ studentId: 'student-1', status: 'PRESENT' }], professorOwner),
    ).resolves.not.toThrow()
  })

  it('TUTOR salva em qualquer oficina', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    await expect(
      saveAttendances('workshop-1', [{ studentId: 'student-1', status: 'PRESENT' }], tutorActor),
    ).resolves.not.toThrow()
  })

  it('ADMIN salva em qualquer oficina', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    await expect(
      saveAttendances('workshop-1', [{ studentId: 'student-1', status: 'PRESENT' }], adminActor),
    ).resolves.not.toThrow()
  })

  it('lança ForbiddenError se PROFESSOR não é dono', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)

    await expect(
      saveAttendances('workshop-1', [{ studentId: 'student-1', status: 'PRESENT' }], professorOther),
    ).rejects.toThrow(ForbiddenError)

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(
      saveAttendances('id-inexistente', [{ studentId: 'student-1', status: 'PRESENT' }], professorOwner),
    ).rejects.toThrow(NotFoundError)

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })
})

// ─── saveAttendances — comportamento ─────────────────────────────────────────

describe('saveAttendances — comportamento', () => {
  it('cria attendances novas em bulk', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    const items = [
      { studentId: 'student-1', status: 'PRESENT' as const },
      { studentId: 'student-2', status: 'ABSENT' as const },
    ]

    await saveAttendances('workshop-1', items, professorOwner)

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  it('faz upsert atualizando status de attendances existentes', async () => {
    const workshop = makeWorkshop({ attendances: [makeAttendance()] })
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    await saveAttendances('workshop-1', [{ studentId: 'student-1', status: 'ABSENT' }], professorOwner)

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  it('salva mix de PRESENT e ABSENT corretamente', async () => {
    const workshop = makeWorkshop()
    mockPrisma.workshop.findUnique.mockResolvedValue(workshop)
    mockPrisma.$transaction.mockResolvedValue([])

    const items = [
      { studentId: 'student-1', status: 'PRESENT' as const },
      { studentId: 'student-2', status: 'ABSENT' as const },
      { studentId: 'student-3', status: 'PRESENT' as const },
    ]

    await saveAttendances('workshop-1', items, tutorActor)

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    const transactionArg = mockPrisma.$transaction.mock.calls[0][0]
    expect(transactionArg).toHaveLength(3)
  })
})

// ─── updateAttendance ─────────────────────────────────────────────────────────

describe('updateAttendance', () => {
  it('PROFESSOR dono atualiza status de presença', async () => {
    const att = makeAttendance({ workshop: makeWorkshop() })
    mockPrisma.attendance.findUnique.mockResolvedValue(att)
    mockPrisma.attendance.update.mockResolvedValue({ ...att, status: 'ABSENT' })

    await expect(
      updateAttendance('att-1', 'ABSENT', professorOwner),
    ).resolves.not.toThrow()

    expect(mockPrisma.attendance.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'att-1' }, data: { status: 'ABSENT' } }),
    )
  })

  it('TUTOR atualiza status de qualquer presença', async () => {
    const att = makeAttendance({ workshop: makeWorkshop() })
    mockPrisma.attendance.findUnique.mockResolvedValue(att)
    mockPrisma.attendance.update.mockResolvedValue({ ...att, status: 'ABSENT' })

    await expect(updateAttendance('att-1', 'ABSENT', tutorActor)).resolves.not.toThrow()
  })

  it('ADMIN atualiza status de qualquer presença', async () => {
    const att = makeAttendance({ workshop: makeWorkshop() })
    mockPrisma.attendance.findUnique.mockResolvedValue(att)
    mockPrisma.attendance.update.mockResolvedValue({ ...att, status: 'ABSENT' })

    await expect(updateAttendance('att-1', 'ABSENT', adminActor)).resolves.not.toThrow()
  })

  it('lança NotFoundError se attendance não existe', async () => {
    mockPrisma.attendance.findUnique.mockResolvedValue(null)

    await expect(updateAttendance('id-inexistente', 'ABSENT', professorOwner)).rejects.toThrow(
      NotFoundError,
    )
    expect(mockPrisma.attendance.update).not.toHaveBeenCalled()
  })

  it('lança ForbiddenError se PROFESSOR não é dono do workshop', async () => {
    const att = makeAttendance({ workshop: makeWorkshop() })
    mockPrisma.attendance.findUnique.mockResolvedValue(att)

    await expect(updateAttendance('att-1', 'ABSENT', professorOther)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.attendance.update).not.toHaveBeenCalled()
  })
})
