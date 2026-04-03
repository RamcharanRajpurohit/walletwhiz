'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { useTransactions } from '@/context/TransactionContext'

function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}

function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))
  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2.5 border-2 border-yellow-200 rounded-xl bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-yellow-200 rounded-xl shadow-xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-yellow-50 transition-colors ${value === opt.value ? 'bg-yellow-50 font-medium' : 'text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExpenseFilters() {
  const { filters, setFilters } = useTransactions()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      if (val.length === 0 || val.length >= 2) {
        setFilters({ ...filters, search: val })
      }
    }, 300)
  }
  const categoryRef = useRef<HTMLDivElement>(null)
  useOutsideClick(categoryRef, () => setCategoryOpen(false))

  const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === filters.category)

  return (
    <div className="bg-white border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
            />
          </div>
        </div>

        {/* Category — only relevant for expenses */}
        <div className={filters.type === 'income' ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(o => !o)}
              className="w-full px-3 py-2.5 border-2 border-yellow-200 rounded-xl bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              {selectedCategory ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedCategory.color}20` }}>
                    <selectedCategory.icon className="h-3 w-3" style={{ color: selectedCategory.color }} />
                  </div>
                  <span className="text-sm text-gray-900 truncate">{selectedCategory.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">All Categories</span>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoryOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-yellow-200 rounded-xl shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setFilters({ ...filters, category: '' }); setCategoryOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-yellow-50 transition-colors ${!filters.category ? 'bg-yellow-50' : ''}`}
                >
                  All Categories
                </button>
                {DEFAULT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setFilters({ ...filters, category: cat.id }); setCategoryOpen(false) }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-yellow-50 transition-colors ${filters.category === cat.id ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                      <cat.icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                    </div>
                    <span className="text-sm text-gray-800">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <CustomSelect
            value={filters.type || ''}
            onChange={(val) => setFilters({ ...filters, type: val as 'income' | 'expense' | '', category: val === 'income' ? '' : filters.category })}
            placeholder="All Types"
            options={[
              { value: '', label: 'All Types' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
          />
        </div>
      </div>

      {(filters.search || filters.category || filters.startDate || filters.endDate || filters.type) && (
        <button
          onClick={() => { setFilters({}); setSearchInput('') }}
          className="mt-4 text-sm text-rose-500 hover:text-rose-600 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
