'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkshopSchema } from '@/modules/workshops/workshop.schema'
import type { Workshop } from '@/modules/workshops/workshop.types'

type ThemeOption = { id: string; name: string }

type Props = {
  themes: ThemeOption[]
  workshop?: Workshop
  canDelete?: boolean
}

export function WorkshopForm({ themes, workshop, canDelete }: Props) {
  const router = useRouter()
  const isEditing = Boolean(workshop)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const input = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      location: formData.get('location') as string,
      themeId: formData.get('themeId') as string,
    }

    const parsed = createWorkshopSchema.safeParse(input)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `/api/workshops/${workshop!.id}` : '/api/workshops'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (response.ok) {
        router.push('/workshops')
        return
      }

      const data = await response.json()
      setError(data.error ?? 'Erro ao salvar oficina')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta oficina?')) return
    setLoading(true)
    try {
      const response = await fetch(`/api/workshops/${workshop!.id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/workshops')
        return
      }
      const data = await response.json()
      setError(data.error ?? 'Erro ao excluir oficina')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const defaultDate = workshop?.date
    ? new Date(workshop.date).toISOString().slice(0, 16)
    : ''

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Título *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={workshop?.title ?? ''}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="date">Data e hora *</label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={defaultDate}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="location">Local *</label>
        <input
          id="location"
          name="location"
          type="text"
          required
          defaultValue={workshop?.location ?? ''}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="themeId">Tema *</label>
        <select
          id="themeId"
          name="themeId"
          required
          defaultValue={workshop?.themeId ?? ''}
          disabled={loading}
        >
          <option value="">Selecione um tema</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar oficina'}
      </button>
      {isEditing && canDelete && (
        <button type="button" onClick={handleDelete} disabled={loading}>
          Excluir oficina
        </button>
      )}
    </form>
  )
}
