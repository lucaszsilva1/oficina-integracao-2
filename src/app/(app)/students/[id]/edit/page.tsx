import { notFound } from 'next/navigation'
import { findById } from '@/modules/students/student.repository'
import { StudentForm } from '@/components/students/student-form'

type Props = {
  params: { id: string }
}

export default async function EditStudentPage({ params }: Props) {
  const student = await findById(params.id)
  if (!student) notFound()

  return (
    <main>
      <h1>Editar Aluno</h1>
      <StudentForm student={student} />
    </main>
  )
}
