'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApiErrorMessage } from '@/lib/api-error'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/workshops')
        return
      }

      const data = await response.json()
      setError(getApiErrorMessage(data.error, 'Erro ao fazer login'))
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="card" style={{ width: '100%', maxWidth: '24rem' }}>
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required disabled={loading} />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" required disabled={loading} />
          </div>
          {error && <p role="alert">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
