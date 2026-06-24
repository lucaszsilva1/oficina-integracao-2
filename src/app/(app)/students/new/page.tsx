import { StudentForm } from '@/components/students/student-form'

export default function NewStudentPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Cadastrar Aluno</h1>
      </div>
      <StudentForm />
    </div>
  )
}
