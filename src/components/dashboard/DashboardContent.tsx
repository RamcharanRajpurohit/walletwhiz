'use client'

import { useEffect, useState } from 'react'
import { TrendingUp,Receipt, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import RecentExpenses from './RecentExpenses'
import ExpenseChart from './ExpenseChart'

interface DashboardStats {
  totalSpent: number
  expenseCount: number
  averageExpense: number
  monthlyChange: number
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reports')
      const data = await res.json()
      setStats(data.stats || {
        totalSpent: 0,
        expenseCount: 0,
        averageExpense: 0,
        monthlyChange: 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Spent',
      value: formatCurrency(stats?.totalSpent || 0),
      icon: DollarSign,
      color: 'from-yellow-400 to-yellow-500',
    },
    {
      title: 'Total Expenses',
      value: stats?.expenseCount || 0,
      icon: Receipt,
      color: 'from-rose-400 to-rose-500',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(stats?.averageExpense || 0),
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your expense overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${card.color} rounded-xl`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <RecentExpenses />
      </div>
    </div>
  )
}