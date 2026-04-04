'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertCircle, ChevronDown } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { toast } from 'sonner'
import { Expense } from '@/types/expense'
import { useTransactions } from '@/context/TransactionContext'

interface ExpenseModalProps {
  expense?: Expense | null
  onClose: () => void
  onSuccess: () => void
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || '',
    type: (expense?.type || 'expense') as 'income' | 'expense',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    note: expense?.note || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setMounted(true))

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false)
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose(onClose)
    }

    document.addEventListener('mousedown', handler)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
      window.cancelAnimationFrame(raf)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const requestClose = (afterClose: () => void) => {
    if (isClosing) return
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      afterClose()
    }, 220)
  }

  const isVisible = mounted && !isClosing

  const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === formData.category)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
      newErrors.amount = 'Please enter a valid amount'
    if (!formData.category)
      newErrors.category = 'Please select a category'
    if (!formData.date)
      newErrors.date = 'Please select a date'
    if (!formData.note.trim())
      newErrors.note = 'Please add a note'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const payload = {
      amount: Number(formData.amount),
      category: formData.category,
      type: formData.type,
      date: new Date(formData.date),
      note: formData.note.trim(),
      userId: '',
    }

    const ok = expense?._id
      ? await updateTransaction(expense._id, payload)
      : await addTransaction(payload)

    setLoading(false)
    if (ok) {
      toast.success(expense?._id ? 'Transaction updated' : 'Transaction added')
      requestClose(onSuccess)
    }
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(10,8,6,0.64)] px-3 pb-0 pt-12 backdrop-blur-[5px] transition-opacity duration-200 sm:items-center sm:px-6 sm:pb-6 sm:pt-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={() => requestClose(onClose)}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`chrome-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-[var(--border-strong)] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.5)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:rounded-2xl sm:p-6 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.98] opacity-0 sm:translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-base)]">
            {expense?._id ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={() => requestClose(onClose)} className="rounded-lg p-2 text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Type</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  formData.type === 'expense'
                    ? 'bg-[var(--danger)] text-white shadow-sm'
                    : 'bg-[var(--surface-muted)] text-[var(--text-soft)] hover:bg-[var(--surface-muted-hover)]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'bg-[var(--success)] text-white shadow-sm'
                    : 'bg-[var(--surface-muted)] text-[var(--text-soft)] hover:bg-[var(--surface-muted-hover)]'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: '' }) }}
              className={`w-full rounded-xl border bg-[var(--surface-strong)] px-4 py-3 text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.amount ? 'border-[var(--danger)]' : 'border-[var(--border-input)]'}`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-2 flex items-center text-sm text-[var(--danger)]"><AlertCircle className="mr-1 h-4 w-4" />{errors.amount}</p>}
          </div>

          {/* Custom category picker */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Category</label>
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen(o => !o)}
                className={`flex w-full items-center justify-between rounded-xl border bg-[var(--surface-strong)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.category ? 'border-[var(--danger)]' : 'border-[var(--border-input)]'}`}
              >
                {selectedCategory ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${selectedCategory.color}20` }}>
                      <selectedCategory.icon className="h-3.5 w-3.5" style={{ color: selectedCategory.color }} />
                    </div>
                    <span className="text-sm text-[var(--text-base)]">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--text-muted)]">Select a category</span>
                )}
                <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryOpen && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[var(--border-col)] bg-[var(--surface-elevated)] shadow-lg">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, category: cat.id })
                        if (errors.category) setErrors({ ...errors, category: '' })
                        setCategoryOpen(false)
                      }}
                      className={`flex w-full items-center space-x-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-muted)] ${formData.category === cat.id ? 'bg-[var(--surface-muted)]' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                      </div>
                      <span className="text-sm text-[var(--text-soft)]">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <p className="mt-2 flex items-center text-sm text-[var(--danger)]"><AlertCircle className="mr-1 h-4 w-4" />{errors.category}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }) }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full rounded-xl border bg-[var(--surface-strong)] px-4 py-3 text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.date ? 'border-[var(--danger)]' : 'border-[var(--border-input)]'}`}
            />
            {errors.date && <p className="mt-2 flex items-center text-sm text-[var(--danger)]"><AlertCircle className="mr-1 h-4 w-4" />{errors.date}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => { setFormData({ ...formData, note: e.target.value }); if (errors.note) setErrors({ ...errors, note: '' }) }}
              rows={3}
              maxLength={500}
              className={`w-full resize-none rounded-xl border bg-[var(--surface-strong)] px-4 py-3 text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] ${errors.note ? 'border-[var(--danger)]' : 'border-[var(--border-input)]'}`}
              placeholder="What was this for?"
            />
            {errors.note && <p className="mt-2 flex items-center text-sm text-[var(--danger)]"><AlertCircle className="mr-1 h-4 w-4" />{errors.note}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => requestClose(onClose)}
              className="flex-1 rounded-xl border border-[var(--border-col)] px-4 py-3 font-medium text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : expense?._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null

  return createPortal(modalContent, document.body)
}
