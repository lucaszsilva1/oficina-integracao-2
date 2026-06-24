import { cookies } from 'next/headers'
import Link from 'next/link'
import { verifyToken } from '@/lib/auth'
import { listWorkshops } from '@/modules/workshops/workshop.service'
import type { Workshop } from '@/modules/workshops/workshop.types'

async function getUserPayload() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export default async function WorkshopsPage() {
  const [workshops, payload] = await Promise.all([listWorkshops(), getUserPayload()])
  const canManage = payload?.role === 'PROFESSOR' || payload?.role === 'ADMIN'

  return (
    <div className="page">
      <div className="page-header">
        <h1>Oficinas</h1>
        {payload?.role === 'PROFESSOR' && (
          <Link href="/workshops/new" className="btn">
            Nova Oficina
          </Link>
        )}
      </div>
      {workshops.length === 0 ? (
        <p className="empty">Nenhuma oficina cadastrada.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Local</th>
              <th>Tema</th>
              <th>Professor</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {(workshops as Workshop[]).map((workshop) => (
              <tr key={workshop.id}>
                <td>{workshop.title}</td>
                <td>{new Date(workshop.date).toLocaleDateString('pt-BR')}</td>
                <td>{workshop.location}</td>
                <td>{workshop.theme ? workshop.theme.name : '—'}</td>
                <td>{workshop.professor ? workshop.professor.name : '—'}</td>
                {canManage && (
                  <td>
                    <Link href={`/workshops/${workshop.id}/edit`} className="btn btn--sm">
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
