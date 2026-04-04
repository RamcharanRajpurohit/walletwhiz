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
      <div className="paper-card relative flex h-80 items-center justify-center rounded-[2rem]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--border-col)] border-t-[var(--accent)]"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Spent',
      value: formatCurrency(reportStats?.totalSpent || 0),
      icon: DollarSign,
      iconBg: 'linear-gradient(135deg, #c39166 0%, #9b5a39 100%)',
    },
    {
      title: 'Total Transactions',
      value: reportStats?.expenseCount || 0,
      icon: Receipt,
      iconBg: 'linear-gradient(135deg, #6d8676 0%, #365045 100%)',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(reportStats?.averageExpense || 0),
      icon: TrendingUp,
      iconBg: 'linear-gradient(135deg, #8d7c95 0%, #63556f 100%)',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="paper-card relative rounded-[2rem] p-6 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">{card.title}</p>
                <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
              </div>
              <div
                className="rounded-[1rem] p-3 shadow-[0_16px_32px_rgba(21,18,16,0.12)]"
                style={{ background: card.iconBg }}
              >
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
