import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { findById } from '@/modules/workshops/workshop.repository'
import { listThemes } from '@/modules/themes/theme.service'
import { WorkshopForm } from '@/components/workshops/workshop-form'

type Props = {
  params: { id: string }
}

export default async function EditWorkshopPage({ params }: Props) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) notFound()

  const payload = await verifyToken(token).catch(() => null)
  if (!payload) notFound()

  const [workshop, themes] = await Promise.all([findById(params.id), listThemes()])
  if (!workshop) notFound()

  const canDelete =
    payload.role === 'ADMIN' ||
    (payload.role === 'PROFESSOR' && workshop.professorId === payload.id)

  return (
    <main>
      <h1>Editar Oficina</h1>
      <WorkshopForm themes={themes} workshop={workshop} canDelete={canDelete} />
    </main>
  )
}
