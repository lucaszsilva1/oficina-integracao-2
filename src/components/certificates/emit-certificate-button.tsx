'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getApiErrorMessage } from '@/lib/api-error'

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
        setError(getApiErrorMessage(data.error, 'Erro ao emitir certificado'))
        return
      }
      router.refresh()
    })
  }

  return (
    <span>
      <button type="button" className="btn btn--sm" onClick={handleEmit} disabled={isPending}>
        {isPending ? 'Emitindo...' : 'Emitir Certificado'}
      </button>
      {error && (
        <span role="alert" className="error--inline">
          {error}
        </span>
      )}
    </span>
  )
}
