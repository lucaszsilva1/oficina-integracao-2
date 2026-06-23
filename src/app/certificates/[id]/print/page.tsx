// Rota PÚBLICA — sem autenticação (exceção consciente ao padrão de autorização do
// CLAUDE.md §10): o link do certificado é enviado diretamente ao aluno, que não
// possui login no sistema. Acessa o banco sem ler cookies, por isso force-dynamic
// (CLAUDE.md §23 — pré-renderização estática falharia sem banco no build).
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { NotFoundError } from '@/lib/errors'
import { getCertificateForPrint } from '@/modules/certificates/certificate.service'

type Props = {
  params: { id: string }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function CertificatePrintPage({ params }: Props) {
  const cert = await getCertificateForPrint(params.id).catch((error) => {
    if (error instanceof NotFoundError) notFound()
    throw error
  })

  return (
    <div className="certificate-page">
      <style>{certificateStyles}</style>

      <article className="certificate">
        <header className="certificate__header">
          <p className="certificate__institution">
            Projeto ELLP — Ensino Lúdico de Lógica e Programação
          </p>
          <p className="certificate__institution-sub">UTFPR — Campus Cornélio Procópio</p>
        </header>

        <h1 className="certificate__title">Certificado de Participação</h1>

        <p className="certificate__body">
          Certificamos que <strong>{cert.studentName}</strong> participou da oficina{' '}
          <strong>{cert.workshopTitle}</strong> (tema: {cert.themeName}), realizada em{' '}
          {formatDate(cert.workshopDate)}, com carga de {cert.totalClasses}{' '}
          {cert.totalClasses === 1 ? 'aula' : 'aulas'}, sob responsabilidade do(a) professor(a){' '}
          <strong>{cert.professorName}</strong>.
        </p>

        <footer className="certificate__footer">
          <div>
            <span className="certificate__label">Número do certificado</span>
            <span className="certificate__value">{cert.number}</span>
          </div>
          <div>
            <span className="certificate__label">Emitido em</span>
            <span className="certificate__value">{formatDate(cert.issuedAt)}</span>
          </div>
        </footer>
      </article>
    </div>
  )
}

const certificateStyles = `
  .certificate-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f4f4f5;
    font-family: Georgia, 'Times New Roman', serif;
    color: #1f2937;
  }
  .certificate {
    max-width: 800px;
    width: 100%;
    background: #ffffff;
    border: 6px double #1e3a8a;
    border-radius: 4px;
    padding: 3.5rem 3rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    text-align: center;
  }
  .certificate__institution {
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
    color: #1e3a8a;
  }
  .certificate__institution-sub {
    font-size: 0.85rem;
    margin: 0.25rem 0 0;
    color: #4b5563;
  }
  .certificate__title {
    font-size: 2rem;
    margin: 2rem 0;
    letter-spacing: 0.05em;
  }
  .certificate__body {
    font-size: 1.15rem;
    line-height: 1.8;
    margin: 0 auto 2.5rem;
    max-width: 640px;
  }
  .certificate__footer {
    display: flex;
    justify-content: space-around;
    gap: 2rem;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #d1d5db;
  }
  .certificate__label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
  }
  .certificate__value {
    display: block;
    font-size: 0.95rem;
    margin-top: 0.25rem;
    word-break: break-all;
  }
  @media print {
    .certificate-page {
      min-height: auto;
      padding: 0;
      background: #ffffff;
    }
    .certificate {
      border: 6px double #1e3a8a;
      box-shadow: none;
      max-width: none;
    }
  }
`
