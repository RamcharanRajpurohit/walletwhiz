import { NextRequest, NextResponse } from 'next/server'
import { buildBackendUrl, setAuthCookies } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendResponse = await fetch(buildBackendUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: payload?.message ?? 'Login failed' },
        { status: backendResponse.status }
      )
    }

    const accessToken = payload?.data?.accessToken ?? payload?.data?.token
    const refreshToken = payload?.data?.refreshToken
    const user = payload?.data?.user

    if (!accessToken || !refreshToken || !user) {
      return NextResponse.json({ message: 'Invalid login response' }, { status: 502 })
    }

    const response = NextResponse.json({ user })
    setAuthCookies(response, {
      accessToken,
      refreshToken,
    })

    return response
  } catch {
    return NextResponse.json({ message: 'Unable to complete login' }, { status: 500 })
  }
}
