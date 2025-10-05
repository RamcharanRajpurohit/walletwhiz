import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportsContent from '@/components/reports/ReportsContent'

export const metadata: Metadata = {
  title: 'Reports - Expense Tracker',
  description: 'View expense reports and analytics',
}

export default async function ReportsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <ReportsContent />
}
