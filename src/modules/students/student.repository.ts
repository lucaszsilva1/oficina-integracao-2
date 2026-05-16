import { prisma } from '@/lib/prisma'
import type { CreateStudentInput, UpdateStudentInput } from './student.types'

export async function findAll(search?: string) {
  return prisma.student.findMany({
    where: search
      ? { name: { contains: search, mode: 'insensitive' } }
      : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function findById(id: string) {
  return prisma.student.findUnique({ where: { id } })
}

export async function hasCertificates(id: string): Promise<boolean> {
  const count = await prisma.certificate.count({
    where: { attendance: { studentId: id } },
  })
  return count > 0
}

export async function createStudent(data: CreateStudentInput) {
  return prisma.student.create({ data })
}

export async function updateStudent(id: string, data: Partial<UpdateStudentInput>) {
  return prisma.student.update({ where: { id }, data })
}

export async function deleteStudent(id: string) {
  return prisma.student.delete({ where: { id } })
}
