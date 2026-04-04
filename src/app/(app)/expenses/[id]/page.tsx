import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/backend'

export const metadata: Metadata = {
  title: 'Expense Details - Expense Tracker',
}

export default async function ExpenseDetailPage({
}: {
  params: { id: string }
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value

  if (!accessToken && !refreshToken) {
    redirect('/login')
  }

  // This is a placeholder - typically you'd fetch and display expense details
  // For now, redirect to expenses list
  redirect('/expenses')
}
