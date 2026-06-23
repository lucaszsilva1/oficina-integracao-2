import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

// página pública de impressão do certificado: /certificates/[id]/print
// (exceção consciente ao padrão de autorização — CLAUDE.md §10)
const PUBLIC_PATH_PATTERNS = [/^\/certificates\/[^/]+\/print$/]

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // verifica só a existência do cookie — JWT é validado em cada API Route (Node.js)
  // se precisar verificar JWT aqui: extrair src/lib/jwt.ts com funções jose apenas (Edge-safe)
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
