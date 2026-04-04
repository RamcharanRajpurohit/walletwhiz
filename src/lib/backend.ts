import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const ACCESS_COOKIE_NAME = 'walletwhiz_access_token'
export const REFRESH_COOKIE_NAME = 'walletwhiz_refresh_token'
export const AUTH_COOKIE_NAME = ACCESS_COOKIE_NAME

const ACCESS_COOKIE_MAX_AGE = 60 * 15
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export type SessionTokens = {
  accessToken: string
  refreshToken: string
}

type BackendSessionFailure = {
  ok: false
  status: number
  message: string
  clearAuth?: boolean
}

type BackendSessionSuccess<T = unknown> = {
  ok: true
  payload: T
  refreshedTokens?: SessionTokens
}

export type BackendSessionResult<T = unknown> =
  | BackendSessionFailure
  | BackendSessionSuccess<T>

export function getBackendBaseUrl() {
  const baseUrl = process.env.BACKEND_API_URL

  if (!baseUrl) {
    throw new Error('BACKEND_API_URL is not configured')
  }

  return baseUrl.replace(/\/$/, '')
}

export function buildBackendUrl(pathname: string, params?: URLSearchParams) {
  const url = new URL(`${getBackendBaseUrl()}${pathname}`)

  if (params) {
    url.search = params.toString()
  }

  return url.toString()
}

export async function getAccessToken() {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null
}

export async function getRefreshToken() {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null
}

export async function getAuthToken() {
  return getAccessToken()
}

export async function hasSessionCookie() {
  const cookieStore = await cookies()
  return Boolean(
    cookieStore.get(ACCESS_COOKIE_NAME)?.value ??
    cookieStore.get(REFRESH_COOKIE_NAME)?.value
  )
}

export function setAuthCookies(response: NextResponse, tokens: SessionTokens) {
  const secure = process.env.NODE_ENV === 'production'

  response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  })

  response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE_NAME)
  response.cookies.delete(REFRESH_COOKIE_NAME)
}

async function parseJson(response: Response) {
  return response.json().catch(() => null)
}

async function refreshSession(refreshToken: string): Promise<BackendSessionResult<{ data?: unknown }>> {
  try {
    const response = await fetch(buildBackendUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })

    const payload = await parseJson(response)

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: payload?.message ?? 'Failed to refresh session',
        clearAuth: response.status === 401 || response.status === 403,
      }
    }

    const accessToken = payload?.data?.accessToken ?? payload?.data?.token
    const nextRefreshToken = payload?.data?.refreshToken

    if (!accessToken || !nextRefreshToken) {
      return {
        ok: false,
        status: 502,
        message: 'Invalid refresh response',
        clearAuth: true,
      }
    }

    return {
      ok: true,
      payload,
      refreshedTokens: {
        accessToken,
        refreshToken: nextRefreshToken,
      },
    }
  } catch {
    return {
      ok: false,
      status: 503,
      message: 'Authentication service is unavailable',
    }
  }
}

export async function fetchBackendWithSession<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<BackendSessionResult<T>> {
  const accessToken = await getAccessToken()
  const refreshToken = await getRefreshToken()

  const sendRequest = async (token: string) => {
    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${token}`)

    return fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    })
  }

  let currentAccessToken = accessToken
  let refreshedTokens: SessionTokens | undefined

  if (!currentAccessToken && refreshToken) {
    const refreshResult = await refreshSession(refreshToken)

    if (!refreshResult.ok) {
      return refreshResult
    }

    currentAccessToken = refreshResult.refreshedTokens!.accessToken
    refreshedTokens = refreshResult.refreshedTokens
  }

  if (!currentAccessToken) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
      clearAuth: Boolean(refreshToken),
    }
  }

  let response = await sendRequest(currentAccessToken)
  let payload = await parseJson(response)

  if (response.status === 401 && refreshToken) {
    const refreshResult = await refreshSession(refreshToken)

    if (!refreshResult.ok) {
      return refreshResult
    }

    currentAccessToken = refreshResult.refreshedTokens!.accessToken
    refreshedTokens = refreshResult.refreshedTokens
    response = await sendRequest(currentAccessToken)
    payload = await parseJson(response)
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: payload?.message ?? 'Backend request failed',
      clearAuth: response.status === 401,
    }
  }

  return {
    ok: true,
    payload: payload as T,
    refreshedTokens,
  }
}
