import Link from 'next/link'
import { LogoutButton } from './logout-button'

export function Navbar() {
  return (
    <nav className="nav">
      <Link href="/" className="nav__brand">
        ELLP — Oficinas
      </Link>
      <Link href="/workshops" className="nav__link">
        Oficinas
      </Link>
      <Link href="/themes" className="nav__link">
        Temas
      </Link>
      <Link href="/students" className="nav__link">
        Alunos
      </Link>
      <LogoutButton />
    </nav>
  )
}
