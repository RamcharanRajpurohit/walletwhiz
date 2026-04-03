'use client'

import { useState, useRef, useEffect } from 'react'
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
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[70]">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {expense?._id ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  formData.type === 'expense'
                    ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: '' }) }}
              className={`w-full px-4 py-3 border-2 ${errors.amount ? 'border-rose-300' : 'border-yellow-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-2 text-sm text-rose-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.amount}</p>}
          </div>

          {/* Custom category picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen(o => !o)}
                className={`w-full px-4 py-3 border-2 ${errors.category ? 'border-rose-300' : 'border-yellow-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-white flex items-center justify-between`}
              >
                {selectedCategory ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${selectedCategory.color}20` }}>
                      <selectedCategory.icon className="h-3.5 w-3.5" style={{ color: selectedCategory.color }} />
                    </div>
                    <span className="text-sm text-gray-900">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Select a category</span>
                )}
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-yellow-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, category: cat.id })
                        if (errors.category) setErrors({ ...errors, category: '' })
                        setCategoryOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-yellow-50 transition-colors ${formData.category === cat.id ? 'bg-yellow-50' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                      </div>
                      <span className="text-sm text-gray-800">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <p className="mt-2 text-sm text-rose-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }) }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 ${errors.date ? 'border-rose-300' : 'border-yellow-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200`}
            />
            {errors.date && <p className="mt-2 text-sm text-rose-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => { setFormData({ ...formData, note: e.target.value }); if (errors.note) setErrors({ ...errors, note: '' }) }}
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-3 border-2 ${errors.note ? 'border-rose-300' : 'border-yellow-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 resize-none`}
              placeholder="What was this for?"
            />
            {errors.note && <p className="mt-2 text-sm text-rose-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.note}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : expense?._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
