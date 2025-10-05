import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-rose-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}