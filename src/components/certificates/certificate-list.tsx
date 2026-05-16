import { EmitCertificateButton } from './emit-certificate-button'
import type { PresenceWithCertificate } from '@/modules/certificates/certificate.types'

type Props = {
  presences: PresenceWithCertificate[]
  workshopId: string
  canEmit: boolean
}

export function CertificateList({ presences, workshopId, canEmit }: Props) {
  if (presences.length === 0) {
    return <p>Nenhuma presença registrada para esta oficina.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Certificado</th>
          <th>Emitido em</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {presences.map((p) => (
          <tr key={p.attendanceId}>
            <td>{p.studentName}</td>
            <td>{p.certificate ? p.certificate.number : '—'}</td>
            <td>
              {p.certificate
                ? new Date(p.certificate.issuedAt).toLocaleDateString('pt-BR')
                : '—'}
            </td>
            <td>
              {!p.certificate && canEmit && (
                <EmitCertificateButton
                  workshopId={workshopId}
                  attendanceId={p.attendanceId}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
