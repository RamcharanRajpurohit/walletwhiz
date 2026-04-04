import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/backend'

export default async function Home() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value

  if (accessToken || refreshToken) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
