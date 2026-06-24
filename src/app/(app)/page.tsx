import Link from 'next/link'

const modules = [
  {
    href: '/workshops',
    title: 'Oficinas',
    description: 'Cadastre oficinas, registre presença e emita certificados.',
  },
  {
    href: '/themes',
    title: 'Temas',
    description: 'Gerencie os temas das oficinas (Scratch, Lógica, etc.).',
  },
  {
    href: '/students',
    title: 'Alunos',
    description: 'Cadastre e busque os alunos participantes das oficinas.',
  },
]

export default function Home() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>ELLP — Controle de Oficinas</h1>
      </div>
      <p>Sistema de gerenciamento de oficinas do projeto de extensão ELLP / UTFPR.</p>

      <div className="card-grid">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="card card--link">
            <h2>{mod.title}</h2>
            <p>{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
