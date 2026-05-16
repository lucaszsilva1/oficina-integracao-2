import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listStudents, createStudent, updateStudent, deleteStudent } from '@/modules/students/student.service'
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    certificate: {
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  student: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  certificate: {
    count: ReturnType<typeof vi.fn>
  }
}

const makeStudent = (overrides = {}) => ({
  id: 'student-1',
  name: 'Ana Silva',
  school: 'Escola Estadual',
  age: 12,
  createdAt: new Date(),
  ...overrides,
})

const adminActor = { id: 'admin-1', role: 'ADMIN' as const }
const professorActor = { id: 'prof-1', role: 'PROFESSOR' as const }
const tutorActor = { id: 'tutor-1', role: 'TUTOR' as const }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── listStudents ─────────────────────────────────────────────────────────────

describe('listStudents', () => {
  it('retorna todos os alunos quando não há filtro', async () => {
    const students = [makeStudent(), makeStudent({ id: 'student-2', name: 'Bruno Lima' })]
    mockPrisma.student.findMany.mockResolvedValue(students)

    const result = await listStudents()

    expect(result).toEqual(students)
    expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    )
  })

  it('retorna alunos filtrados por nome (case insensitive)', async () => {
    const students = [makeStudent()]
    mockPrisma.student.findMany.mockResolvedValue(students)

    const result = await listStudents('ana')

    expect(result).toEqual(students)
    expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { contains: 'ana', mode: 'insensitive' } },
      }),
    )
  })

  it('retorna array vazio quando não há alunos', async () => {
    mockPrisma.student.findMany.mockResolvedValue([])

    const result = await listStudents()

    expect(result).toEqual([])
  })

  it('retorna array vazio quando busca não encontra resultado', async () => {
    mockPrisma.student.findMany.mockResolvedValue([])

    const result = await listStudents('xyz-inexistente')

    expect(result).toEqual([])
  })
})

// ─── createStudent ────────────────────────────────────────────────────────────

describe('createStudent', () => {
  it('cria aluno válido com nome, escola e idade', async () => {
    const student = makeStudent()
    mockPrisma.student.create.mockResolvedValue(student)

    const result = await createStudent({ name: 'Ana Silva', school: 'Escola Estadual', age: 12 })

    expect(result).toEqual(student)
    expect(mockPrisma.student.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Ana Silva' }) }),
    )
  })

  it('cria aluno válido apenas com nome (escola e idade ausentes)', async () => {
    const student = makeStudent({ school: null, age: null })
    mockPrisma.student.create.mockResolvedValue(student)

    const result = await createStudent({ name: 'Ana Silva' })

    expect(result).toEqual(student)
    expect(mockPrisma.student.create).toHaveBeenCalledOnce()
  })

  it('lança ValidationError se nome está vazio', async () => {
    await expect(createStudent({ name: '' })).rejects.toThrow(ValidationError)
    expect(mockPrisma.student.create).not.toHaveBeenCalled()
  })
})

// ─── updateStudent ────────────────────────────────────────────────────────────

describe('updateStudent', () => {
  it('atualiza aluno existente com novos dados', async () => {
    const existing = makeStudent()
    const updated = makeStudent({ name: 'Ana Costa' })
    mockPrisma.student.findUnique.mockResolvedValue(existing)
    mockPrisma.student.update.mockResolvedValue(updated)

    const result = await updateStudent('student-1', { name: 'Ana Costa' })

    expect(result).toEqual(updated)
    expect(mockPrisma.student.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'student-1' } }),
    )
  })

  it('lança NotFoundError se aluno não existe', async () => {
    mockPrisma.student.findUnique.mockResolvedValue(null)

    await expect(updateStudent('id-inexistente', { name: 'X' })).rejects.toThrow(NotFoundError)
    expect(mockPrisma.student.update).not.toHaveBeenCalled()
  })
})

// ─── deleteStudent — ADMIN ────────────────────────────────────────────────────

describe('deleteStudent — ADMIN', () => {
  it('exclui aluno com certificados (cascade — banco resolve)', async () => {
    const student = makeStudent()
    mockPrisma.student.findUnique.mockResolvedValue(student)
    mockPrisma.student.delete.mockResolvedValue(student)

    await deleteStudent('student-1', adminActor)

    expect(mockPrisma.student.delete).toHaveBeenCalledWith({ where: { id: 'student-1' } })
    expect(mockPrisma.certificate.count).not.toHaveBeenCalled()
  })

  it('exclui aluno sem certificados', async () => {
    const student = makeStudent()
    mockPrisma.student.findUnique.mockResolvedValue(student)
    mockPrisma.student.delete.mockResolvedValue(student)

    await deleteStudent('student-1', adminActor)

    expect(mockPrisma.student.delete).toHaveBeenCalledOnce()
  })

  it('lança NotFoundError se aluno não existe', async () => {
    mockPrisma.student.findUnique.mockResolvedValue(null)

    await expect(deleteStudent('id-inexistente', adminActor)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.student.delete).not.toHaveBeenCalled()
  })
})

// ─── deleteStudent — PROFESSOR e TUTOR ───────────────────────────────────────

describe('deleteStudent — PROFESSOR e TUTOR', () => {
  it('exclui aluno sem certificados (PROFESSOR)', async () => {
    const student = makeStudent()
    mockPrisma.student.findUnique.mockResolvedValue(student)
    mockPrisma.certificate.count.mockResolvedValue(0)
    mockPrisma.student.delete.mockResolvedValue(student)

    await deleteStudent('student-1', professorActor)

    expect(mockPrisma.student.delete).toHaveBeenCalledWith({ where: { id: 'student-1' } })
  })

  it('lança ConflictError se aluno tem certificados (PROFESSOR)', async () => {
    const student = makeStudent()
    mockPrisma.student.findUnique.mockResolvedValue(student)
    mockPrisma.certificate.count.mockResolvedValue(2)

    await expect(deleteStudent('student-1', professorActor)).rejects.toThrow(ConflictError)
    expect(mockPrisma.student.delete).not.toHaveBeenCalled()
  })

  it('lança ConflictError se aluno tem certificados (TUTOR)', async () => {
    const student = makeStudent()
    mockPrisma.student.findUnique.mockResolvedValue(student)
    mockPrisma.certificate.count.mockResolvedValue(1)

    await expect(deleteStudent('student-1', tutorActor)).rejects.toThrow(ConflictError)
    expect(mockPrisma.student.delete).not.toHaveBeenCalled()
  })

  it('lança NotFoundError se aluno não existe (TUTOR)', async () => {
    mockPrisma.student.findUnique.mockResolvedValue(null)

    await expect(deleteStudent('id-inexistente', tutorActor)).rejects.toThrow(NotFoundError)
    expect(mockPrisma.student.delete).not.toHaveBeenCalled()
  })
})
