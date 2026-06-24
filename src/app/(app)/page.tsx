import Link from 'next/link'

export default function Home() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>ELLP — Controle de Oficinas</h1>
      </div>
      <p>Sistema de gerenciamento de oficinas do projeto de extensão ELLP / UTFPR.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link href="/workshops" className="btn">
          Oficinas
        </Link>
        <Link href="/themes" className="btn">
          Temas
        </Link>
        <Link href="/students" className="btn">
          Alunos
        </Link>
      </div>
    </div>
  )
}
