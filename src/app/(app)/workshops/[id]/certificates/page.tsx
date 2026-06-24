export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { listCertificates } from '@/modules/certificates/certificate.service'
import { CertificateList } from '@/components/certificates/certificate-list'
import { prisma } from '@/lib/prisma'

type Props = {
  params: { id: string }
}

export default async function CertificatesPage({ params }: Props) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) notFound()

  const payload = await verifyToken(token).catch(() => null)
  if (!payload) notFound()

  const workshop = await prisma.workshop.findUnique({ where: { id: params.id } })
  if (!workshop) notFound()

  const canEmit =
    payload.role === 'ADMIN' ||
    (payload.role === 'PROFESSOR' && workshop.professorId === payload.id)

  const presences = await listCertificates(params.id)

  return (
    <main>
      <h2>Certificados — {workshop.title}</h2>
      <CertificateList
        presences={presences}
        workshopId={params.id}
        canEmit={canEmit}
      />
    </main>
  )
}
