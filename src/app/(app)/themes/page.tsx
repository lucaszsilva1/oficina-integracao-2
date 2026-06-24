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
    <div className="page">
      <div className="page-header">
        <h1>Temas de Oficina</h1>
        {canManage && (
          <Link href="/themes/new" className="btn">
            Novo Tema
          </Link>
        )}
      </div>
      {themes.length === 0 ? (
        <p className="empty">Nenhum tema cadastrado.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {themes.map((theme: Theme) => (
              <tr key={theme.id}>
                <td>{theme.name}</td>
                <td>{theme.description || '—'}</td>
                {canManage && (
                  <td>
                    <Link href={`/themes/${theme.id}/edit`} className="btn btn--sm">
                      Editar
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
