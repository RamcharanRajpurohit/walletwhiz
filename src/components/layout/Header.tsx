'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, X, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-2 border-yellow-200/50 sticky top-0 z-50">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-yellow-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Sun className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-rose-600 bg-clip-text text-transparent">
              Expense Tracker
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-200">
          <nav className="px-4 py-4 space-y-2">
            <a href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-yellow-100 font-medium">
              Dashboard
            </a>
            <a href="/expenses" className="block px-4 py-3 rounded-lg hover:bg-yellow-100 font-medium">
              Expenses
            </a>
            <a href="/reports" className="block px-4 py-3 rounded-lg hover:bg-yellow-100 font-medium">
              Reports
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}