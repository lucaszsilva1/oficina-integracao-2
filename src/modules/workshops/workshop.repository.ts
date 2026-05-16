import { prisma } from '@/lib/prisma'
import type { CreateWorkshopInput, UpdateWorkshopInput } from './workshop.types'

const workshopInclude = {
  theme: { select: { id: true, name: true, slug: true } },
  professor: { select: { id: true, name: true, email: true, role: true } },
}

export async function findAll() {
  return prisma.workshop.findMany({
    orderBy: { date: 'desc' },
    include: workshopInclude,
  })
}

export async function findById(id: string) {
  return prisma.workshop.findUnique({
    where: { id },
    include: workshopInclude,
  })
}

export async function findThemeById(themeId: string) {
  return prisma.theme.findUnique({ where: { id: themeId } })
}

export async function hasCertificates(workshopId: string): Promise<boolean> {
  const count = await prisma.certificate.count({
    where: { attendance: { workshopId } },
  })
  return count > 0
}

export async function createWorkshop(data: CreateWorkshopInput & { professorId: string }) {
  return prisma.workshop.create({
    data,
    include: workshopInclude,
  })
}

export async function updateWorkshop(id: string, data: Partial<UpdateWorkshopInput>) {
  return prisma.workshop.update({
    where: { id },
    data,
    include: workshopInclude,
  })
}

export async function deleteWorkshop(id: string) {
  return prisma.workshop.delete({ where: { id } })
}
