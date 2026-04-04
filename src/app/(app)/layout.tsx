'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { TransactionProvider } from '@/context/TransactionContext'
import { useAuth } from '@/context/AuthContext'
import DashboardContent from '@/components/dashboard/DashboardContent'
import ExpensesContent from '@/components/expenses/ExpensesContent'
import ReportsContent from '@/components/reports/ReportsContent'
import InsightsContent from '@/components/insights/InsightsContent'
import { navigateTo, useClientPath } from '@/hooks/useClientPath'
import { canAccessAnalytics, canAccessPath, canReadRecords } from '@/types/auth'

export default function AppLayout({ children: _ }: { children: React.ReactNode }) {
  const pathname = useClientPath()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading || !pathname) return

    if (!user) {
      window.location.href = '/login'
      return
    }

    if (!canAccessPath(user.role, pathname)) {
      navigateTo('/dashboard')
    }
  }, [loading, pathname, user])

  if (loading || !user) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-6">
        <div className="chrome-card animate-rise-in rounded-[2rem] px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[var(--border-col)] border-t-[var(--accent)]" />
          <p className="mt-5 text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">Preparing workspace</p>
          <h2 className="mt-3 font-display text-2xl text-[var(--text-base)]">Laying out your finance journal</h2>
        </div>
      </div>
    )
  }

  return (
    <TransactionProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="min-h-screen md:pl-[22rem]">
          <main className="app-main min-w-0 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-6">
            <Header />

            <div className="mt-6 space-y-6">
              <div className={!pathname || pathname === '/dashboard' ? '' : 'hidden'}><DashboardContent /></div>
              <div className={pathname === '/expenses' && canReadRecords(user.role) ? '' : 'hidden'}><ExpensesContent /></div>
              <div className={pathname === '/reports' && canAccessAnalytics(user.role) ? '' : 'hidden'}><ReportsContent /></div>
              <div className={pathname === '/insights' && canAccessAnalytics(user.role) ? '' : 'hidden'}><InsightsContent /></div>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </TransactionProvider>
  )
}
