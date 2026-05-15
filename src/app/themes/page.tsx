import { cookies } from 'next/headers'
import Link from 'next/link'
import { verifyToken } from '@/lib/auth'
import { listThemes } from '@/modules/themes/theme.service'
import type { Theme } from '@/modules/themes/theme.types'

async function getUserRole(): Promise<string | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return payload.role
  } catch {
    return null
  }
}

export default async function ThemesPage() {
  const [themes, role] = await Promise.all([listThemes(), getUserRole()])
  const canManage = role === 'PROFESSOR' || role === 'ADMIN'

  return (
    <main>
      <h1>Temas de Oficina</h1>
      {canManage && <Link href="/themes/new">Novo Tema</Link>}
      {themes.length === 0 ? (
        <p>Nenhum tema cadastrado.</p>
      ) : (
        <ul>
          {themes.map((theme: Theme) => (
            <li key={theme.id}>
              <strong>{theme.name}</strong>
              {theme.description && <p>{theme.description}</p>}
              {canManage && <Link href={`/themes/${theme.id}/edit`}>Editar</Link>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
