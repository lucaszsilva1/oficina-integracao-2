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
    <main>
      <h1>Oficinas</h1>
      {payload?.role === 'PROFESSOR' && <Link href="/workshops/new">Nova Oficina</Link>}
      {workshops.length === 0 ? (
        <p>Nenhuma oficina cadastrada.</p>
      ) : (
        <ul>
          {(workshops as Workshop[]).map((workshop) => (
            <li key={workshop.id}>
              <strong>{workshop.title}</strong>
              <p>
                {new Date(workshop.date).toLocaleDateString('pt-BR')} — {workshop.location}
              </p>
              {workshop.theme && <p>Tema: {workshop.theme.name}</p>}
              {workshop.professor && <p>Professor: {workshop.professor.name}</p>}
              {canManage && <Link href={`/workshops/${workshop.id}/edit`}>Editar</Link>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
