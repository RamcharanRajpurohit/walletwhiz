import { Sun } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-rose-50">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-rose-200/20 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sun className="h-10 w-10 text-yellow-500" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Expense Tracker
              </h1>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
