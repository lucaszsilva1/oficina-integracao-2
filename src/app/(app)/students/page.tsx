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
    <div className="page">
      <div className="page-header">
        <h1>Alunos</h1>
        <Link href="/students/new" className="btn">
          Cadastrar aluno
        </Link>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Suspense>
          <StudentSearch />
        </Suspense>
      </div>
      {students.length === 0 ? (
        <p className="empty">Nenhum aluno encontrado.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Escola</th>
              <th>Idade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(students as Student[]).map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.school || '—'}</td>
                <td>{student.age ? `${student.age} anos` : '—'}</td>
                <td>
                  <Link href={`/students/${student.id}/edit`} className="btn btn--sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
