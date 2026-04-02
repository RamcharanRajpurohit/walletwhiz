'use client'

import { TrendingUp, DollarSign, Receipt } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import CategoryChart from './CategoryChart'
import MonthlyChart from './MonthlyChart'
import { useTransactions } from '@/context/TransactionContext'

export default function ReportsContent() {
  const { reportStats, loadingReports } = useTransactions()

  if (loadingReports) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Spent',
      value: formatCurrency(reportStats?.totalSpent || 0),
      icon: DollarSign,
      color: 'from-yellow-400 to-yellow-500',
    },
    {
      title: 'Total Transactions',
      value: reportStats?.expenseCount || 0,
      icon: Receipt,
      color: 'from-rose-400 to-rose-500',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(reportStats?.averageExpense || 0),
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
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
        <CategoryChart />
        <MonthlyChart />
      </div>
    </div>
  )
}
