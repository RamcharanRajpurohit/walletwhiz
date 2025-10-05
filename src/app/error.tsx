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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-rose-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-8">
          We encountered an error while processing your request.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
