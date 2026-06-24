'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Role } from '@prisma/client'
import { LogoutButton } from './logout-button'

type Props = {
  user: { email: string; role: Role }
}

const LINKS = [
  { href: '/workshops', label: 'Oficinas' },
  { href: '/themes', label: 'Temas' },
  { href: '/students', label: 'Alunos' },
]

export function Navbar({ user }: Props) {
  const pathname = usePathname()

  return (
    <nav className="nav" aria-label="Navegação principal">
      <Link href="/" className="nav__brand">
        ELLP — Oficinas
      </Link>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav__link${active ? ' nav__link--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        )
      })}
      <span className="nav__user">
        {user.email} · {user.role}
      </span>
      <LogoutButton />
    </nav>
  )
}
