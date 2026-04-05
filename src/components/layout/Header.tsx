'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, CloudCheck, CloudOff, LoaderCircle, LogOut, Moon, Plus, Sun, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import ExpenseModal from '@/components/expenses/ExpenseModal'
import { useClientPath } from '@/hooks/useClientPath'
import { useOfflineQueueStatus } from '@/hooks/useOfflineQueueStatus'
import { canManageRecords } from '@/types/auth'
import { DEMO_ROLE_ACCOUNTS, UserRole } from '@/types/auth'

export default function Header() {
  const { user, logout, switchRole } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = useClientPath()
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  const selectedRole = user?.role ?? (Object.keys(DEMO_ROLE_ACCOUNTS)[0] as UserRole)
  const showAddTransaction = canManageRecords(user?.role ?? null)
  const { isOnline, pendingCount, syncing } = useOfflineQueueStatus()
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  const queueLabel = !isOnline
    ? (pendingCount > 0 ? `Offline · ${pendingCount} queued` : 'Offline')
    : syncing
      ? (pendingCount > 0 ? `Syncing ${pendingCount}` : 'Syncing')
      : pendingCount > 0
        ? `${pendingCount} queued`
        : 'Synced'

  const queueToneClass = !isOnline
    ? 'text-[var(--danger)]'
    : syncing
      ? 'text-[var(--accent)]'
      : pendingCount > 0
        ? 'text-[var(--accent)]'
        : 'text-[var(--success)]'

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

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRoleMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    setIsRoleMenuOpen(false)
  }, [selectedRole])

  useEffect(() => {
    setIsExpenseModalOpen(false)
  }, [pathname])

  return (
    <section className="chrome-card animate-rise-in relative z-20 overflow-visible rounded-[2rem] p-5 transition-all duration-300 ease-out md:p-7">
      <div className="flex flex-wrap items-center gap-3 xl:items-start xl:justify-between">
          <span className="editorial-pill">
            <Wallet className="h-3.5 w-3.5" />
            WalletWhiz
          </span>
          <span className="hidden md:contents">
            <span className="editorial-pill">
              <CalendarDays className="h-3.5 w-3.5" />
              {dateLabel}
            </span>
            <span className={`editorial-pill ${queueToneClass}`}>
              {!isOnline ? (
                <CloudOff className="h-3.5 w-3.5" />
              ) : syncing ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : pendingCount > 0 ? (
                <CloudOff className="h-3.5 w-3.5" />
              ) : (
                <CloudCheck className="h-3.5 w-3.5" />
              )}
              {queueLabel}
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
          {showAddTransaction && (
            <>
              <span className="md:hidden">
                <button onClick={() => setIsExpenseModalOpen(true)} className="editorial-pill" style={{ cursor: 'pointer' }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </span>
              <span className="hidden md:contents">
                <button onClick={() => setIsExpenseModalOpen(true)} className="premium-button shrink-0">
                  <Plus className="h-4 w-4" />
                  <span>Add Transaction</span>
                </button>
              </span>
            </>
          )}

          <div ref={roleMenuRef} className="relative z-30 hidden md:block">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen((open) => !open)}
              className="premium-button-secondary min-w-[10rem] justify-between gap-3 pl-4 pr-3"
              aria-haspopup="listbox"
              aria-expanded={isRoleMenuOpen}
            >
              <span className="text-sm font-medium">{DEMO_ROLE_ACCOUNTS[selectedRole].label}</span>
              <ChevronDown className={`mt-[1px] h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleMenuOpen && (
              <div className="chrome-card absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-[11rem] overflow-hidden rounded-2xl p-1" role="listbox" aria-label="Switch role">
                {(Object.entries(DEMO_ROLE_ACCOUNTS) as Array<[UserRole, typeof DEMO_ROLE_ACCOUNTS[UserRole]]>).map(([role, account]) => (
                  <button
                    key={role}
                    type="button"
                    role="option"
                    aria-selected={selectedRole === role}
                    onClick={() => {
                      setIsRoleMenuOpen(false)
                      void handleSwitchRole(role)
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${selectedRole === role ? 'bg-[var(--surface-inverse)] text-[var(--surface)] dark:bg-[var(--surface-inverse-soft)] dark:text-[var(--text-base)]' : 'text-[var(--text-base)] hover:bg-[var(--surface-muted-hover)] dark:text-[var(--text-soft)]'}`}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="hidden md:contents">
            <button
              onClick={toggleTheme}
              className="premium-button-secondary"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4 text-[var(--accent)]" />
                : <Moon className="h-4 w-4 text-[var(--text-soft)]" />
              }
            </button>

            <button
              onClick={handleLogout}
              className="premium-button-secondary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </span>
          </div>
      </div>

      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={() => setIsExpenseModalOpen(false)}
        />
      )}
    </section>
  )
}
