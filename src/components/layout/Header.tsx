'use client'
import { Sun, Moon, ShieldCheck, Eye, LogOut, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'

export default function Header() {
  const { role, setRole } = useRole()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-2 border-yellow-200/50 sticky top-0 z-50">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Wallet className="h-7 w-7 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-rose-600 bg-clip-text text-transparent">
              WalletWhiz
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun className="h-5 w-5 text-yellow-400" />
                : <Moon className="h-5 w-5 text-gray-500" />
              }
            </button>

            {/* Role Switcher — desktop only */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => { setRole('admin'); toast.success('Switched to Admin mode') }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-yellow-400 to-rose-400 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => { setRole('viewer'); toast.success('Switched to Viewer mode') }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === 'viewer'
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>Viewer</span>
              </button>
            </div>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
