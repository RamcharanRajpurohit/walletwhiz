import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/backend'

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get(AUTH_COOKIE_NAME)?.value
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value
  const hasSession = Boolean(accessToken || refreshToken)

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/expenses') ||
      req.nextUrl.pathname.startsWith('/reports') ||
      req.nextUrl.pathname.startsWith('/insights')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Auth routes redirect if logged in
  if (req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/signup')) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/expenses/:path*', '/reports/:path*', '/insights/:path*', '/login', '/signup']
}
