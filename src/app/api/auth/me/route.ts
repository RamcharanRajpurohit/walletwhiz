import { NextResponse } from 'next/server'
import { buildBackendUrl, clearAuthCookies, fetchBackendWithSession, setAuthCookies } from '@/lib/backend'

export async function GET() {
  try {
    const result = await fetchBackendWithSession<{ data?: unknown }>(buildBackendUrl('/auth/me'))

    if (!result.ok) {
      const response = NextResponse.json({ message: result.message }, { status: result.status })

      if (result.clearAuth) {
        clearAuthCookies(response)
      }

      return response
    }

    const response = NextResponse.json({ user: result.payload?.data ?? null })

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch {
    return NextResponse.json({ message: 'Unable to load current user' }, { status: 503 })
  }
}
