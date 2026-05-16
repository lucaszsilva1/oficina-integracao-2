import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import {
  createCertificate,
  listCertificates,
  deleteCertificate,
} from '@/modules/certificates/certificate.service'
import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    certificate: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    workshop: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  attendance: {
    findUnique: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
  certificate: {
    create: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  workshop: {
    findUnique: ReturnType<typeof vi.fn>
  }
}

const adminActor = { id: 'admin-1', role: 'ADMIN' as const }
const professorOwner = { id: 'prof-1', role: 'PROFESSOR' as const }
const professorOther = { id: 'prof-2', role: 'PROFESSOR' as const }
const tutorActor = { id: 'tutor-1', role: 'TUTOR' as const }

function makeAttendanceWithCertificate(overrides: Record<string, unknown> = {}) {
  return {
    id: 'att-1',
    workshopId: 'workshop-1',
    studentId: 'student-1',
    status: 'PRESENT',
    createdAt: new Date(),
    certificate: null,
    workshop: { id: 'workshop-1', professorId: 'prof-1' },
    ...overrides,
  }
}

function makeCertificate(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cert-1',
    attendanceId: 'att-1',
    number: 'test-uuid-1234',
    issuedAt: new Date(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── createCertificate ────────────────────────────────────────────────────────

describe('createCertificate', () => {
  it('emite certificado para presença PRESENT — PROFESSOR dono', async () => {
    const attendance = makeAttendanceWithCertificate()
    const cert = makeCertificate()
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)
    mockPrisma.certificate.create.mockResolvedValue(cert)

    const result = await createCertificate('att-1', professorOwner)

    expect(mockPrisma.certificate.create).toHaveBeenCalledOnce()
    expect(result).toEqual(cert)
  })

  it('emite certificado para presença PRESENT — ADMIN', async () => {
    const attendance = makeAttendanceWithCertificate()
    const cert = makeCertificate()
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)
    mockPrisma.certificate.create.mockResolvedValue(cert)

    const result = await createCertificate('att-1', adminActor)

    expect(mockPrisma.certificate.create).toHaveBeenCalledOnce()
    expect(result).toEqual(cert)
  })

  it('número gerado é string não vazia (UUID válido)', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234' as ReturnType<typeof crypto.randomUUID>)
    const attendance = makeAttendanceWithCertificate()
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)
    mockPrisma.certificate.create.mockResolvedValue(makeCertificate())

    await createCertificate('att-1', professorOwner)

    expect(mockPrisma.certificate.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ number: 'test-uuid-1234' }) }),
    )
  })

  it('lança ForbiddenError se PROFESSOR não é dono da oficina', async () => {
    const attendance = makeAttendanceWithCertificate()
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)

    await expect(createCertificate('att-1', professorOther)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled()
  })

  it('lança ForbiddenError se TUTOR tenta emitir', async () => {
    const attendance = makeAttendanceWithCertificate()
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)

    await expect(createCertificate('att-1', tutorActor)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled()
  })

  it('lança ConflictError se presença tem status ABSENT', async () => {
    const attendance = makeAttendanceWithCertificate({ status: 'ABSENT' })
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)

    await expect(createCertificate('att-1', professorOwner)).rejects.toThrow(ConflictError)
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled()
  })

  it('lança ConflictError se certificado já foi emitido para essa presença', async () => {
    const attendance = makeAttendanceWithCertificate({ certificate: makeCertificate() })
    mockPrisma.attendance.findUnique.mockResolvedValue(attendance)

    await expect(createCertificate('att-1', professorOwner)).rejects.toThrow(ConflictError)
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled()
  })

  it('lança NotFoundError se attendance não existe', async () => {
    mockPrisma.attendance.findUnique.mockResolvedValue(null)

    await expect(createCertificate('id-inexistente', professorOwner)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.certificate.create).not.toHaveBeenCalled()
  })
})

// ─── listCertificates ─────────────────────────────────────────────────────────

describe('listCertificates', () => {
  it('retorna presenças PRESENT com certificados emitidos e sem certificado', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue({ id: 'workshop-1' })
    const presences = [
      { id: 'att-1', student: { id: 'student-1', name: 'Ana' }, certificate: makeCertificate() },
      { id: 'att-2', student: { id: 'student-2', name: 'Bia' }, certificate: null },
    ]
    mockPrisma.attendance.findMany.mockResolvedValue(presences)

    const result = await listCertificates('workshop-1')

    expect(result).toHaveLength(2)
    expect(result[0].certificate).not.toBeNull()
    expect(result[1].certificate).toBeNull()
  })

  it('retorna array vazio quando não há presenças PRESENT', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue({ id: 'workshop-1' })
    mockPrisma.attendance.findMany.mockResolvedValue([])

    const result = await listCertificates('workshop-1')

    expect(result).toEqual([])
  })

  it('lança NotFoundError se workshop não existe', async () => {
    mockPrisma.workshop.findUnique.mockResolvedValue(null)

    await expect(listCertificates('id-inexistente')).rejects.toThrow(NotFoundError)
    expect(mockPrisma.attendance.findMany).not.toHaveBeenCalled()
  })
})

// ─── deleteCertificate ────────────────────────────────────────────────────────

describe('deleteCertificate', () => {
  it('ADMIN exclui certificado existente', async () => {
    const cert = makeCertificate()
    mockPrisma.certificate.findUnique.mockResolvedValue(cert)
    mockPrisma.certificate.delete.mockResolvedValue(cert)

    await expect(deleteCertificate('cert-1', adminActor)).resolves.not.toThrow()
    expect(mockPrisma.certificate.delete).toHaveBeenCalledWith({ where: { id: 'cert-1' } })
  })

  it('lança ForbiddenError se PROFESSOR tenta excluir', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue(makeCertificate())

    await expect(deleteCertificate('cert-1', professorOwner)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.certificate.delete).not.toHaveBeenCalled()
  })

  it('lança ForbiddenError se TUTOR tenta excluir', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue(makeCertificate())

    await expect(deleteCertificate('cert-1', tutorActor)).rejects.toThrow(ForbiddenError)
    expect(mockPrisma.certificate.delete).not.toHaveBeenCalled()
  })

  it('lança NotFoundError se certificado não existe', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue(null)

    await expect(deleteCertificate('id-inexistente', adminActor)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.certificate.delete).not.toHaveBeenCalled()
  })
})
