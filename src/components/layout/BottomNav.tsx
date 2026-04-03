'use client'

import { useState } from 'react'
import { LayoutDashboard, Receipt, BarChart3, Lightbulb, Settings, ShieldCheck, Eye, LogOut, Sun, Moon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'
import { useClientPath, navigateTo } from '@/hooks/useClientPath'

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
]

export default function BottomNav() {
  const pathname = useClientPath()
  const { role, setRole } = useRole()
  const { theme, toggleTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-yellow-200/50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (!pathname && href === '/dashboard')
            return (
              <button
                key={href}
                onClick={() => navigateTo(href)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${active ? 'text-rose-500' : 'text-gray-400'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-rose-500' : 'text-gray-400'}`}>
                  {label}
                </span>
                {active && <span className="w-1 h-1 rounded-full bg-rose-400 mt-0.5" />}
              </button>
            )
          })}

          {/* Settings tab */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
          >
            <Settings className="h-6 w-6 text-gray-400" strokeWidth={1.8} />
            <span className="text-[10px] font-medium text-gray-400">More</span>
          </button>
        </div>
      </nav>

      {/* Settings sheet overlay */}
      {settingsOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {theme === 'dark'
                  ? <Sun className="h-5 w-5 text-yellow-400" />
                  : <Moon className="h-5 w-5 text-gray-500" />
                }
              </button>
            </div>

            {/* Role */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRole('admin'); toast.success('Switched to Admin mode') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-yellow-400 to-rose-400 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
                <button
                  onClick={() => { setRole('viewer'); toast.success('Switched to Viewer mode') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    role === 'viewer'
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Viewer
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}
