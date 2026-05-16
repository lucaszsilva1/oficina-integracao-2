'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function StudentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    router.replace(`/students?${params.toString()}`)
  }

  return (
    <input
      type="search"
      placeholder="Buscar aluno por nome..."
      defaultValue={searchParams.get('search') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
