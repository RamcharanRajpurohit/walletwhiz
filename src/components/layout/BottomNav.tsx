'use client'

import { useState } from 'react'
import { LayoutDashboard, Receipt, BarChart3, Lightbulb, Settings, LogOut, Sun, Moon, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { canAccessAnalytics, canReadRecords, DEMO_ROLE_ACCOUNTS, UserRole } from '@/types/auth'
import { useClientPath, navigateTo } from '@/hooks/useClientPath'
import ExpenseModal from '@/components/expenses/ExpenseModal'

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Ledger' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/insights', icon: Lightbulb, label: 'Signals' },
]

export default function BottomNav() {
  const pathname = useClientPath()
  const { user, logout, switchRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  const handleSwitchRole = async (role: UserRole) => {
    if (user?.role === role) return

    const result = await switchRole(role)

    if (!result.ok) {
      toast.error(result.message || 'Failed to switch account')
      return
    }

    toast.success(`Switched to ${DEMO_ROLE_ACCOUNTS[role].label}`)
  }

  const visibleTabs = tabs.filter((tab) => {
    if (tab.href === '/dashboard') return true
    if (tab.href === '/expenses') return canReadRecords(user?.role ?? null)
    return canAccessAnalytics(user?.role ?? null)
  })

  return (
    <>
      <nav className="md:hidden fixed inset-x-4 bottom-4 z-50">
        <div className="mobile-dock rounded-[1.8rem] px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {visibleTabs.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (!pathname && href === '/dashboard')

              return (
                <button
                  key={href}
                  onClick={() => navigateTo(href)}
                  className={`rounded-[1.25rem] px-2 py-2.5 transition-all ${active ? 'bg-[var(--surface-inverse)] text-[var(--surface)] shadow-[0_14px_30px_rgba(21,18,16,0.16)]' : 'text-[var(--text-soft)]'}`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
                    <span className="text-[10px] font-semibold tracking-[0.08em] uppercase">{label}</span>
                  </div>
                </button>
              )
            })}

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-[1.25rem] px-2 py-2.5 text-[var(--text-soft)]"
            >
              <div className="flex flex-col items-center gap-1.5">
                <Settings className="h-[18px] w-[18px]" strokeWidth={1.9} />
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase">More</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={() => setIsExpenseModalOpen(false)}
        />
      )}

      {settingsOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSettingsOpen(false)} />
          <div className="chrome-card relative rounded-t-[2rem] px-5 pb-7 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Workspace</p>
                <h3 className="mt-2 text-2xl text-[var(--text-base)]">Personal settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-muted)]"
              >
                <X className="h-5 w-5 text-[var(--text-soft)]" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-[var(--border-col)] bg-[rgba(255,255,255,0.45)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-base)]">{user?.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[1.4rem] border border-[var(--border-col)] bg-[rgba(255,255,255,0.45)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-base)]">Appearance</p>
                <p className="text-xs text-[var(--text-muted)]">{theme === 'dark' ? 'Evening reading mode' : 'Paper-toned daylight mode'}</p>
              </div>
              <button onClick={toggleTheme} className="premium-button-secondary px-4 py-2">
                {theme === 'dark'
                  ? <Sun className="h-4 w-4 text-[var(--accent)]" />
                  : <Moon className="h-4 w-4 text-[var(--text-soft)]" />
                }
                <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Switch Role</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.entries(DEMO_ROLE_ACCOUNTS) as Array<[UserRole, typeof DEMO_ROLE_ACCOUNTS[UserRole]]>).map(([role, account]) => (
                  <button
                    key={role}
                    onClick={() => void handleSwitchRole(role)}
                    className={`rounded-[1.2rem] px-3 py-3 text-sm font-semibold transition-all ${
                      user?.role === role
                        ? 'bg-[var(--surface-inverse)] text-[var(--surface)] shadow-[0_16px_34px_rgba(21,18,16,0.16)]'
                        : 'border border-[var(--border-col)] bg-[rgba(255,255,255,0.45)] text-[var(--text-soft)]'
                    }`}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} className="premium-button mt-6 w-full justify-center">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
