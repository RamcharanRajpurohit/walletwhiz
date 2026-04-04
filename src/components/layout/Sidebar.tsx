'use client'

import { LayoutDashboard, Receipt, BarChart3, Lightbulb } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { canAccessAnalytics, canReadRecords } from '@/types/auth'
import { cn } from '@/utils/cn'
import { useClientPath, navigateTo } from '@/hooks/useClientPath'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    caption: 'Balance, velocity, and recent movement',
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: Receipt,
    caption: 'The detailed ledger behind the month',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    caption: 'Category exposure and spending cadence',
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Lightbulb,
    caption: 'Signals worth acting on',
  },
]

export default function Sidebar() {
  const pathname = useClientPath()
  const { user } = useAuth()

  const items = navigation.filter((item) => {
    if (item.href === '/dashboard') return true
    if (item.href === '/expenses') return canReadRecords(user?.role ?? null)
    return canAccessAnalytics(user?.role ?? null)
  })

  return (
    <aside className="hidden md:block md:fixed md:left-6 md:top-6 md:bottom-6 md:w-[19rem] md:z-10">
      <div className="ink-card h-full rounded-[2rem] p-6 flex flex-col animate-rise-in">
        
        <nav className="mt-8 flex-1 space-y-3">
          {items.map((item, index) => {
            const isActive = pathname !== null && pathname === item.href

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.href)}
                data-active={isActive}
                className={cn('nav-slat w-full transition-all duration-200 hover:translate-x-1')}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                      isActive
                        ? 'border-[var(--rail-icon-border)] bg-[var(--rail-icon-bg-active)] text-[var(--rail-text-active)]'
                        : 'border-[var(--rail-icon-border)] bg-[var(--rail-icon-bg)] text-[var(--rail-text)]'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.68rem] font-semibold tracking-[0.18em] text-[var(--rail-index)]">
                        0{index + 1}
                      </span>
                      <span className={cn('text-[0.95rem] font-semibold', isActive ? 'text-[var(--rail-text-active)]' : 'text-[var(--rail-text)]')}>
                        {item.name}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--rail-text-soft)]">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

       
      </div>
    </aside>
  )
}
