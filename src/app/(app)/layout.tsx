'use client'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { TransactionProvider } from '@/context/TransactionContext'
import DashboardContent from '@/components/dashboard/DashboardContent'
import ExpensesContent from '@/components/expenses/ExpensesContent'
import ReportsContent from '@/components/reports/ReportsContent'
import InsightsContent from '@/components/insights/InsightsContent'
import { useClientPath } from '@/hooks/useClientPath'

export default function AppLayout({ children: _ }: { children: React.ReactNode }) {
  const pathname = useClientPath()

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-rose-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 md:ml-64">
            <div className={!pathname || pathname === '/dashboard' ? '' : 'hidden'}><DashboardContent /></div>
            <div className={pathname === '/expenses' ? '' : 'hidden'}><ExpensesContent /></div>
            <div className={pathname === '/reports' ? '' : 'hidden'}><ReportsContent /></div>
            <div className={pathname === '/insights' ? '' : 'hidden'}><InsightsContent /></div>
          </main>
        </div>
      </div>
    </TransactionProvider>
  )
}
