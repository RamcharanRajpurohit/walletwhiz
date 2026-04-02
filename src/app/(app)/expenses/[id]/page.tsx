import { Metadata } from 'next'
import {redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Expense Details - Expense Tracker',
}

export default async function ExpenseDetailPage({
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // This is a placeholder - typically you'd fetch and display expense details
  // For now, redirect to expenses list
  redirect('/expenses')
}