import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-9xl font-bold text-transparent">
          404
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-[var(--text-base)]">Page Not Found</h2>
        <p className="mb-8 text-lg text-[var(--text-soft)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-white shadow-lg transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Home className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}