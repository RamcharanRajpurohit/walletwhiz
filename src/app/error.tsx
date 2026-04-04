'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="chrome-card max-w-md rounded-2xl p-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)]">
          <AlertTriangle className="h-8 w-8 text-[var(--danger)]" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-[var(--text-base)]">Something went wrong!</h2>
        <p className="mb-8 text-[var(--text-soft)]">
          We encountered an error while processing your request.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-[var(--accent)] px-6 py-3 text-white shadow-lg transition-colors hover:bg-[var(--accent-strong)]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
