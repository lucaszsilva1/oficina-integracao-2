import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors'
import {
  findAll,
  findById,
  hasCertificates,
  createStudent as repoCreate,
  updateStudent as repoUpdate,
  deleteStudent as repoDelete,
} from './student.repository'
import type { CreateStudentInput, UpdateStudentInput } from './student.types'

type Actor = { id: string; role: 'PROFESSOR' | 'TUTOR' | 'ADMIN' }

export async function listStudents(search?: string) {
  return findAll(search)
}

export async function createStudent(input: CreateStudentInput) {
  if (!input.name || input.name.trim() === '') {
    throw new ValidationError('Nome obrigatório')
  }
  return repoCreate(input)
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  const student = await findById(id)
  if (!student) throw new NotFoundError('Aluno')
  return repoUpdate(id, input)
}

export async function deleteStudent(id: string, actor: Actor) {
  const student = await findById(id)
  if (!student) throw new NotFoundError('Aluno')

  if (actor.role === 'ADMIN') {
    return repoDelete(id)
  }

  if (await hasCertificates(id)) {
    throw new ConflictError('Aluno possui certificados emitidos')
  }

  return repoDelete(id)
}
