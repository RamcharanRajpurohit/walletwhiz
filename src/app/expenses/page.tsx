import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpensesContent from '@/components/expenses/ExpensesContent'

export const metadata: Metadata = {
  title: 'Expenses - Expense Tracker',
  description: 'Manage your expenses',
}

export default async function ExpensesPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <ExpensesContent/>
}
