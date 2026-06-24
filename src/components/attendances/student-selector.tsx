'use client'

import { useState, useTransition } from 'react'
import type { Student } from '@/modules/students/student.types'

type Props = {
  selectedIds: Set<string>
  onSelect: (student: Student) => void
}

export function StudentSelector({ selectedIds, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Student[]>([])
  const [isPending, startTransition] = useTransition()

  function handleSearch(term: string) {
    setSearch(term)
    if (!term.trim()) {
      setResults([])
      return
    }
    startTransition(async () => {
      const res = await fetch(`/api/students?search=${encodeURIComponent(term)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    })
  }

  return (
    <div className="stack">
      <input
        type="search"
        className="input"
        placeholder="Buscar aluno por nome..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isPending}
      />
      {results.length > 0 && (
        <table className="table">
          <tbody>
            {results.map((student) => (
              <tr key={student.id}>
                <td>
                  {student.name}
                  {student.school ? ` — ${student.school}` : ''}
                </td>
                <td style={{ width: '1%', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => onSelect(student)}
                    disabled={selectedIds.has(student.id)}
                  >
                    {selectedIds.has(student.id) ? 'Adicionado' : 'Adicionar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
