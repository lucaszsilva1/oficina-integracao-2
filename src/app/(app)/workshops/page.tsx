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
  const role = payload?.role
  const userId = payload?.id
  const showActions = role === 'ADMIN' || role === 'PROFESSOR' || role === 'TUTOR'

  return (
    <div className="page">
      <div className="page-header">
        <h1>Oficinas</h1>
        {role === 'PROFESSOR' && (
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
              {showActions && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {(workshops as Workshop[]).map((workshop) => {
              const isOwner = role === 'PROFESSOR' && workshop.professorId === userId
              const canEdit = role === 'ADMIN' || role === 'PROFESSOR'
              const canAttend = role === 'ADMIN' || role === 'TUTOR' || isOwner
              const canCert = role === 'ADMIN' || isOwner
              return (
                <tr key={workshop.id}>
                  <td>{workshop.title}</td>
                  <td>{new Date(workshop.date).toLocaleDateString('pt-BR')}</td>
                  <td>{workshop.location}</td>
                  <td>{workshop.theme ? workshop.theme.name : '—'}</td>
                  <td>{workshop.professor ? workshop.professor.name : '—'}</td>
                  {showActions && (
                    <td>
                      <div className="row-actions">
                        {canEdit && (
                          <Link href={`/workshops/${workshop.id}/edit`} className="btn btn--sm">
                            Editar
                          </Link>
                        )}
                        {canAttend && (
                          <Link
                            href={`/workshops/${workshop.id}/attendance`}
                            className="btn btn--sm"
                          >
                            Presença
                          </Link>
                        )}
                        {canCert && (
                          <Link
                            href={`/workshops/${workshop.id}/certificates`}
                            className="btn btn--sm"
                          >
                            Certificados
                          </Link>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
