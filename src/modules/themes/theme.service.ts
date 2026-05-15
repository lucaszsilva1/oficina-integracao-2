import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'
import { findAll, findById, findBySlug, createTheme as repoCreate, updateTheme as repoUpdate } from './theme.repository'
import type { CreateThemeInput, UpdateThemeInput } from './theme.types'

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export async function listThemes() {
  return findAll()
}

export async function createTheme(input: CreateThemeInput) {
  if (!input.name || input.name.trim() === '') {
    throw new ValidationError('Nome obrigatório')
  }

  const slug = slugify(input.name)
  const existing = await findBySlug(slug)
  if (existing) {
    throw new ConflictError('Já existe um tema com este nome')
  }

  return repoCreate({ ...input, slug })
}

export async function updateTheme(id: string, input: UpdateThemeInput) {
  const theme = await findById(id)
  if (!theme) {
    throw new NotFoundError('Tema')
  }

  const data: Partial<{ name: string; description: string | null; slug: string }> = {}

  if (input.name !== undefined) {
    const slug = slugify(input.name)
    const conflicting = await findBySlug(slug)
    if (conflicting && conflicting.id !== id) {
      throw new ConflictError('Já existe um tema com este nome')
    }
    data.name = input.name
    data.slug = slug
  }

  if (input.description !== undefined) {
    data.description = input.description
  }

  return repoUpdate(id, data)
}
