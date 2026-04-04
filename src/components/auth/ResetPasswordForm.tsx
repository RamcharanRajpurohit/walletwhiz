'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function ResetPasswordForm() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-col)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--text-base)]">Reset flow unavailable</h2>
        <p className="text-sm text-[var(--text-soft)]">
          Password reset is not part of the Express assessment backend. Sign in with one of the seeded demo accounts instead.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-strong)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  )
}
