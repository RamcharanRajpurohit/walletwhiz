'use client'

import { LayoutDashboard, Receipt, BarChart3, Lightbulb } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useClientPath, navigateTo } from '@/hooks/useClientPath'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
]

export default function Sidebar() {
  const pathname = useClientPath()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-20">
      <div className="flex flex-col flex-grow bg-white/90 backdrop-blur-md border-r-2 border-yellow-200/50 px-4 py-8">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname !== null && pathname === item.href
            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.href)}
                className={cn(
                  'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-rose-400 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-yellow-100'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
