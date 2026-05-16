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
    <div>
      <input
        type="search"
        placeholder="Buscar aluno por nome..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isPending}
      />
      {results.length > 0 && (
        <ul>
          {results.map((student) => (
            <li key={student.id}>
              <span>
                {student.name}
                {student.school ? ` — ${student.school}` : ''}
              </span>
              <button
                type="button"
                onClick={() => onSelect(student)}
                disabled={selectedIds.has(student.id)}
              >
                {selectedIds.has(student.id) ? 'Adicionado' : 'Adicionar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
