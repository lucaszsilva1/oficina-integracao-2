import { prisma } from '@/lib/prisma'
import type { CreateThemeInput } from './theme.types'

export async function findAll() {
  return prisma.theme.findMany({ orderBy: { name: 'asc' } })
}

export async function findById(id: string) {
  return prisma.theme.findUnique({ where: { id } })
}

export async function findBySlug(slug: string) {
  return prisma.theme.findUnique({ where: { slug } })
}

export async function createTheme(data: CreateThemeInput & { slug: string }) {
  return prisma.theme.create({ data })
}

export async function updateTheme(
  id: string,
  data: Partial<{ name: string; description: string | null; slug: string }>,
) {
  return prisma.theme.update({ where: { id }, data })
}
