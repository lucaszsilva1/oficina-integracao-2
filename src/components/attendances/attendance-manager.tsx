'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSelector } from './student-selector'
import type { Student } from '@/modules/students/student.types'
import type { AttendanceWithStudent } from '@/modules/attendances/attendance.types'

type AttendanceStatus = 'PRESENT' | 'ABSENT'

type WorkshopInfo = {
  id: string
  title: string
}

type AttendanceEntry = {
  studentId: string
  name: string
  status: AttendanceStatus
  attendanceId?: string
}

type Props = {
  workshop: WorkshopInfo
  initialAttendances: AttendanceWithStudent[]
}

function toEntries(attendances: AttendanceWithStudent[]): AttendanceEntry[] {
  return attendances.map((a) => ({
    studentId: a.studentId,
    name: a.student.name,
    status: a.status,
    attendanceId: a.id,
  }))
}

export function AttendanceManager({ workshop, initialAttendances }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<AttendanceEntry[]>(toEntries(initialAttendances))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedIds = new Set(entries.map((e) => e.studentId))

  function handleAddStudent(student: Student) {
    if (selectedIds.has(student.id)) return
    setEntries((prev) => [
      ...prev,
      { studentId: student.id, name: student.name, status: 'ABSENT' },
    ])
  }

  function handleToggleStatus(studentId: string) {
    setEntries((prev) =>
      prev.map((e) =>
        e.studentId === studentId
          ? { ...e, status: e.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
          : e,
      ),
    )
  }

  function handleRemove(studentId: string) {
    setEntries((prev) => prev.filter((e) => e.studentId !== studentId))
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const body = entries.map(({ studentId, status }) => ({ studentId, status }))
      const res = await fetch(`/api/workshops/${workshop.id}/attendances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao salvar presenças')
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <h2>Presença — {workshop.title}</h2>

      <section>
        <h3>Adicionar alunos</h3>
        <StudentSelector selectedIds={selectedIds} onSelect={handleAddStudent} />
      </section>

      <section>
        <h3>Lista de presença</h3>
        {entries.length === 0 ? (
          <p>Nenhum aluno adicionado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Presente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.studentId}>
                  <td>{entry.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={entry.status === 'PRESENT'}
                      onChange={() => handleToggleStatus(entry.studentId)}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemove(entry.studentId)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={isPending || entries.length === 0}>
        {isPending ? 'Salvando...' : 'Salvar Presenças'}
      </button>
    </div>
  )
}
