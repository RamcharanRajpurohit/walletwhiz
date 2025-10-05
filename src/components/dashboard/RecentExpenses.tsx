'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Expense } from '@/types/expense'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentExpenses()
  }, [])

  const fetchRecentExpenses = async () => {
    try {
      const res = await fetch('/api/expenses?limit=5')
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === category)?.icon || '📦'
  }

  if (loading) {
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
        <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          expenses.map((expense) => (
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
              <p className="text-lg font-bold text-rose-600">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}