'use client'

import { useState } from 'react'
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Expense } from '@/types/expense'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import ExpenseModal from './ExpenseModal'
import { toast } from 'sonner'
import { useRole } from '@/context/RoleContext'
import { useTransactions } from '@/context/TransactionContext'

export default function ExpenseList() {
  const { transactions, pagination, loadingTransactions, deleteTransaction, goToPage } = useTransactions()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { role } = useRole()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    const ok = await deleteTransaction(id)
    if (ok) toast.success('Transaction deleted')
  }

  const getCategoryInfo = (categoryId: string) =>
    DEFAULT_CATEGORIES.find(c => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]

  const sorted = [...transactions].sort((a, b) => {
    const cmp = sortBy === 'date'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : a.amount - b.amount
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  if (loadingTransactions) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
              <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-12 shadow-lg text-center">
        <p className="text-gray-500 text-lg">No transactions found</p>
        <p className="text-gray-400 mt-2">
          {role === 'admin' ? 'Add your first transaction to get started!' : 'No transactions to display.'}
        </p>
      </div>
    )
  }

  const { page, totalPages, total } = pagination ?? { page: 1, totalPages: 1, total: transactions.length }
  const from = (page - 1) * 25 + 1
  const to = Math.min(page * 25, total)

  // Page numbers to show: always show first, last, current ±1, with ellipsis
  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 font-medium">Sort:</span>
            <button
              onClick={() => toggleSort('date')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === 'date' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Date {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === 'amount' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Amount {sortBy === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
          <span className="text-sm text-gray-400">
            {from}–{to} of {total} transactions
          </span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {sorted.map((expense) => {
            const category = getCategoryInfo(expense.category)
            const isIncome = expense.type === 'income'
            return (
              <div
                key={expense._id}
                className="flex items-center p-4 gap-3 bg-gradient-to-r from-yellow-50 to-rose-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon className="h-4 w-4" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{expense.note}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-gray-500 truncate max-w-[80px]">{category.name}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{formatDate(expense.date)}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      isIncome ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isIncome ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                      {isIncome ? 'Income' : 'Expense'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <p className={`text-sm font-bold whitespace-nowrap ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                  {role === 'admin' && (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id!)}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                : <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-gradient-to-r from-yellow-400 to-rose-400 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
            )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => setEditingExpense(null)}
        />
      )}
    </>
  )
}
