'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  workshopId: string
  attendanceId: string
}

export function EmitCertificateButton({ workshopId, attendanceId }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEmit() {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/workshops/${workshopId}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao emitir certificado')
        return
      }
      router.refresh()
    })
  }

  return (
    <span>
      <button type="button" onClick={handleEmit} disabled={isPending}>
        {isPending ? 'Emitindo...' : 'Emitir Certificado'}
      </button>
      {error && <span style={{ color: 'red', marginLeft: '8px' }}>{error}</span>}
    </span>
  )
}
