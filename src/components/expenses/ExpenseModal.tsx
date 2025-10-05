'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { toast } from 'sonner'

interface ExpenseModalProps {
  expense?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    note: expense?.note || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }
    if (!formData.note.trim()) {
      newErrors.note = 'Please add a note'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const url = expense?._id ? `/api/expenses/${expense._id}` : '/api/expenses'
      const method = expense?._id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(formData.amount),
          category: formData.category,
          date: new Date(formData.date),
          note: formData.note.trim(),
        }),
      })

      if (!res.ok) throw new Error('Failed to save expense')

      toast.success(expense?._id ? 'Expense updated successfully' : 'Expense added successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {expense?._id ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value })
                if (errors.amount) setErrors({ ...errors, amount: '' })
              }}
              className={`w-full px-4 py-3 border-2 ${
                errors.amount ? 'border-rose-300' : 'border-yellow-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-rose-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value })
                if (errors.category) setErrors({ ...errors, category: '' })
              }}
              className={`w-full px-4 py-3 border-2 ${
                errors.category ? 'border-rose-300' : 'border-yellow-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200`}
            >
              <option value="">Select a category</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-rose-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value })
                if (errors.date) setErrors({ ...errors, date: '' })
              }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 ${
                errors.date ? 'border-rose-300' : 'border-yellow-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200`}
            />
            {errors.date && (
              <p className="mt-2 text-sm text-rose-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => {
                setFormData({ ...formData, note: e.target.value })
                if (errors.note) setErrors({ ...errors, note: '' })
              }}
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-3 border-2 ${
                errors.note ? 'border-rose-300' : 'border-yellow-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none`}
              placeholder="What was this expense for?"
            />
            {errors.note && (
              <p className="mt-2 text-sm text-rose-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.note}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : expense?._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
