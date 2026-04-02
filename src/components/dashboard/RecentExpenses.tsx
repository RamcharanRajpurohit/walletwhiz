'use client'

import { Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { useTransactions } from '@/context/TransactionContext'

export default function RecentExpenses() {
  const { recentTransactions, loadingTransactions } = useTransactions()

  const getCategoryIcon = (category: string) =>
    DEFAULT_CATEGORIES.find(c => c.id === category)?.icon || '📦'

  if (loadingTransactions) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet. Add your first!</p>
          </div>
        ) : (
          recentTransactions.map((expense) => (
            <div
              key={expense._id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-rose-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                <div>
                  <p className="font-medium text-gray-900">{expense.note}</p>
                  <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
