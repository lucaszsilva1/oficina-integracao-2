'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudentSchema } from '@/modules/students/student.schema'
import type { Student } from '@/modules/students/student.types'

type Props = {
  student?: Student
}

export function StudentForm({ student }: Props) {
  const router = useRouter()
  const isEditing = Boolean(student)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const ageRaw = formData.get('age') as string
    const input = {
      name: formData.get('name') as string,
      school: (formData.get('school') as string) || undefined,
      age: ageRaw ? Number(ageRaw) : undefined,
    }

    const parsed = createStudentSchema.safeParse(input)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `/api/students/${student!.id}` : '/api/students'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (response.ok) {
        router.push('/students')
        return
      }

      const data = await response.json()
      setError(data.error ?? 'Erro ao salvar aluno')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return
    setLoading(true)
    try {
      const response = await fetch(`/api/students/${student!.id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/students')
        return
      }
      const data = await response.json()
      setError(data.error ?? 'Erro ao excluir aluno')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nome *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={student?.name ?? ''}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="school">Escola</label>
        <input
          id="school"
          name="school"
          type="text"
          defaultValue={student?.school ?? ''}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="age">Idade</label>
        <input
          id="age"
          name="age"
          type="number"
          min={1}
          defaultValue={student?.age ?? ''}
          disabled={loading}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar aluno'}
      </button>
      {isEditing && (
        <button type="button" onClick={handleDelete} disabled={loading}>
          Excluir aluno
        </button>
      )}
    </form>
  )
}
