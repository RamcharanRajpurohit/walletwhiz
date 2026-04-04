import { NextResponse } from 'next/server'
import { buildBackendUrl, clearAuthCookies, getRefreshToken } from '@/lib/backend'

async function buildLogoutResponse() {
  const response = NextResponse.json({ success: true })

  try {
    const refreshToken = await getRefreshToken()

    if (refreshToken) {
      await fetch(buildBackendUrl('/auth/logout'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      })
    }
  } catch {
    // Local logout should still succeed even if backend session revocation fails.
  }

  clearAuthCookies(response)
  return response
}

export async function POST() {
  return buildLogoutResponse()
}

export async function GET() {
  return buildLogoutResponse()
}
