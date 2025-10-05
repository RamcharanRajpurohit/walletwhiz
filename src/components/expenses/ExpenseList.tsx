'use client'
import { useCallback, useEffect, useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Expense, ExpenseFilters } from '@/types/expense'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import ExpenseModal from './ExpenseModal'
import { toast } from 'sonner'

interface ExpenseListProps {
  filters: ExpenseFilters
  refreshKey: number
  onUpdate: () => void
}

export default function ExpenseList({ filters, refreshKey, onUpdate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`/api/expenses?${params}`)
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch {
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchExpenses()
  }, [filters, refreshKey, fetchExpenses])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Expense deleted successfully')
      onUpdate()
    } catch{
      toast.error('Failed to delete expense')
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
  }

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-12 shadow-lg text-center">
        <p className="text-gray-500 text-lg">No expenses found</p>
        <p className="text-gray-400 mt-2">Add your first expense to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {expenses.map((expense) => {
            const category = getCategoryInfo(expense.category)
            return (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-rose-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{expense.note}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{category.name}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <p className="text-lg font-bold text-rose-600 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id!)}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}


