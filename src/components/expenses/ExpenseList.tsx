'use client'

import { useState } from 'react'
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Expense } from '@/types/expense'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import ExpenseModal from './ExpenseModal'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { canManageRecords } from '@/types/auth'
import { useTransactions } from '@/context/TransactionContext'

export default function ExpenseList() {
  const { transactions, pagination, loadingTransactions, deleteTransaction, goToPage } = useTransactions()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { user } = useAuth()
  const canEdit = canManageRecords(user?.role ?? null)

  const handleDelete = async (id: string) => {
    const ok = await deleteTransaction(id)
    if (ok) toast.success('Transaction deleted')
    setConfirmDeleteId(null)
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
      <div className="paper-card relative rounded-[2rem] p-6">
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
      <div className="paper-card relative rounded-[2rem] p-12 text-center">
        <p className="text-gray-500 text-lg">No transactions found</p>
        <p className="text-gray-400 mt-2">
          {canEdit ? 'Add your first transaction to get started!' : 'No transactions to display.'}
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
      <div className="paper-card relative rounded-[2rem] p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">Sort</span>
            <button
              onClick={() => toggleSort('date')}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                sortBy === 'date' ? 'bg-[var(--surface-inverse)] text-[var(--surface)]' : 'text-[var(--paper-text-soft)] hover:bg-[rgba(84,63,39,0.08)]'
              }`}
            >
              Date {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                sortBy === 'amount' ? 'bg-[var(--surface-inverse)] text-[var(--surface)]' : 'text-[var(--paper-text-soft)] hover:bg-[rgba(84,63,39,0.08)]'
              }`}
            >
              Amount {sortBy === 'amount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
          <span className="text-sm text-[var(--paper-muted)]">
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
                className="flex items-center gap-3 rounded-[1.6rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(84,63,39,0.18)] hover:shadow-[0_18px_34px_rgba(53,38,22,0.08)]"
              >
                <div
                  className="w-10 h-10 shrink-0 rounded-[1rem] flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon className="h-4 w-4" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--paper-text)]">{expense.note}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="max-w-[80px] truncate text-xs text-[var(--paper-text-soft)]">{category.name}</span>
                    <span className="text-xs text-[var(--paper-muted)]">•</span>
                    <span className="text-xs text-[var(--paper-text-soft)]">{formatDate(expense.date)}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      isIncome ? 'bg-[rgba(45,106,79,0.12)] text-[var(--success)]' : 'bg-[rgba(147,68,56,0.12)] text-[var(--danger)]'
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
                  {canEdit && (
                    <div className="flex items-center gap-0.5">
                      {confirmDeleteId === expense._id ? (
                        <>
                          <button
                            onClick={() => handleDelete(expense._id!)}
                            className="px-2 py-1 text-[10px] font-semibold bg-[var(--danger)] text-white rounded-full"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[10px] font-semibold bg-[var(--surface-muted)] text-[var(--text-soft)] rounded-full"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingExpense(expense)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(expense._id!)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-1 border-t border-[var(--paper-border)] pt-4">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-full p-2 text-[var(--paper-text-soft)] transition-colors hover:bg-[rgba(84,63,39,0.08)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="px-2 text-sm text-[var(--paper-muted)]">…</span>
                : <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`min-w-[36px] h-9 px-2 rounded-full text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-[var(--surface-inverse)] text-[var(--surface)] shadow-sm'
                        : 'text-[var(--paper-text-soft)] hover:bg-[rgba(84,63,39,0.08)]'
                    }`}
                  >
                    {p}
                  </button>
            )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-full p-2 text-[var(--paper-text-soft)] transition-colors hover:bg-[rgba(84,63,39,0.08)] disabled:cursor-not-allowed disabled:opacity-30"
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
