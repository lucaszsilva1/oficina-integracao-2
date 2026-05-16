import Link from 'next/link'
import { Suspense } from 'react'
import { listStudents } from '@/modules/students/student.service'
import { StudentSearch } from '@/components/students/student-search'
import type { Student } from '@/modules/students/student.types'

type Props = {
  searchParams: { search?: string }
}

export const dynamic = 'force-dynamic'

export default async function StudentsPage({ searchParams }: Props) {
  const students = await listStudents(searchParams.search)

  return (
    <main>
      <h1>Alunos</h1>
      <Link href="/students/new">Cadastrar aluno</Link>
      <Suspense>
        <StudentSearch />
      </Suspense>
      {students.length === 0 ? (
        <p>Nenhum aluno encontrado.</p>
      ) : (
        <ul>
          {(students as Student[]).map((student) => (
            <li key={student.id}>
              <strong>{student.name}</strong>
              {student.school && <span> — {student.school}</span>}
              {student.age && <span> ({student.age} anos)</span>}
              <Link href={`/students/${student.id}/edit`}>Editar</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
