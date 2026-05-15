'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createThemeSchema } from '@/modules/themes/theme.schema'
import type { Theme } from '@/modules/themes/theme.types'

type Props = {
  theme?: Theme
}

export function ThemeForm({ theme }: Props) {
  const router = useRouter()
  const isEditing = Boolean(theme)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const input = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
    }

    const parsed = createThemeSchema.safeParse(input)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `/api/themes/${theme!.id}` : '/api/themes'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (response.ok) {
        router.push('/themes')
        return
      }

      const data = await response.json()
      setError(data.error ?? 'Erro ao salvar tema')
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
          defaultValue={theme?.name ?? ''}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          defaultValue={theme?.description ?? ''}
          disabled={loading}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar tema'}
      </button>
    </form>
  )
}
