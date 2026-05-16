import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'
import {
  findAll,
  findById,
  findThemeById,
  hasCertificates,
  createWorkshop as repoCreate,
  updateWorkshop as repoUpdate,
  deleteWorkshop as repoDelete,
} from './workshop.repository'
import type { CreateWorkshopInput, UpdateWorkshopInput } from './workshop.types'

type Caller = { id: string; email: string; role: 'PROFESSOR' | 'TUTOR' | 'ADMIN' }

export async function listWorkshops() {
  return findAll()
}

export async function createWorkshop(input: CreateWorkshopInput, caller: Caller) {
  if (!input.title || input.title.trim() === '') {
    throw new ValidationError('Título obrigatório')
  }
  if (!input.date) {
    throw new ValidationError('Data obrigatória')
  }

  const theme = await findThemeById(input.themeId)
  if (!theme) {
    throw new NotFoundError('Tema')
  }

  return repoCreate({ ...input, professorId: caller.id })
}

export async function updateWorkshop(id: string, input: UpdateWorkshopInput, caller: Caller) {
  const workshop = await findById(id)
  if (!workshop) {
    throw new NotFoundError('Oficina')
  }

  if (caller.role === 'PROFESSOR' && workshop.professorId !== caller.id) {
    throw new ForbiddenError('Você não tem permissão para editar esta oficina')
  }

  return repoUpdate(id, input)
}

export async function deleteWorkshop(id: string, caller: Caller) {
  const workshop = await findById(id)
  if (!workshop) {
    throw new NotFoundError('Oficina')
  }

  if (caller.role === 'ADMIN') {
    return repoDelete(id)
  }

  if (workshop.professorId !== caller.id) {
    throw new ForbiddenError('Você não tem permissão para excluir esta oficina')
  }

  if (await hasCertificates(id)) {
    throw new ConflictError('Oficina possui certificados emitidos')
  }

  return repoDelete(id)
}
