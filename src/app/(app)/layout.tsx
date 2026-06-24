import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'

async function getUser() {
  const token = cookies().get('token')?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return { email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <>
      {user && <Navbar user={user} />}
      <main className="page-shell">{children}</main>
    </>
  )
}
