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
  const hasValue = value !== ''

  return (
    <div ref={ref} className={`relative ${open ? 'z-[140]' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] px-3 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
      >
        <span className={hasValue ? 'text-[var(--paper-text)]' : 'text-[var(--paper-text-soft)]'}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--paper-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[150] mt-2 w-full overflow-hidden rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card)] shadow-[var(--shadow-soft)]">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${value === opt.value ? 'bg-[rgba(84,63,39,0.08)] font-medium text-[var(--paper-text)]' : 'text-gray-700 hover:bg-[rgba(84,63,39,0.08)]'}`}
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
    <div className="paper-card relative z-30 overflow-visible rounded-[2rem] p-4 md:p-6">
      {/* Row 1: Search full width */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--paper-muted)]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] py-3 pl-9 pr-4 text-sm text-[var(--paper-text)] placeholder:text-[var(--paper-text-soft)] focus:outline-none focus:ring-2 focus:ring-yellow-200"
        />
      </div>

      {/* Row 2: Category + Type side by side */}
      <div className="grid grid-cols-2 gap-3 mb-3 lg:grid-cols-4 lg:gap-4">
        <div className={filters.type === 'income' ? 'opacity-40 pointer-events-none' : ''}>
          <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">Category</label>
          <div ref={categoryRef} className={`relative ${categoryOpen ? 'z-[140]' : 'z-10'}`}>
            <button
              type="button"
              onClick={() => setCategoryOpen(o => !o)}
              className="flex w-full items-center justify-between rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              {selectedCategory ? (
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedCategory.color}20` }}>
                    <selectedCategory.icon className="h-3 w-3" style={{ color: selectedCategory.color }} />
                  </div>
                  <span className="text-sm text-[var(--paper-text)] truncate">{selectedCategory.name}</span>
                </div>
              ) : (
                <span className="text-sm text-[var(--paper-text-soft)] truncate">All Categories</span>
              )}
              <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--paper-muted)] transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoryOpen && (
              <div className="absolute z-[150] mt-2 w-full overflow-hidden rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card)] shadow-[var(--shadow-soft)]">
                <button
                  type="button"
                  onClick={() => { setFilters({ ...filters, category: '' }); setCategoryOpen(false) }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${!filters.category ? 'bg-[rgba(84,63,39,0.08)] text-[var(--paper-text)]' : 'text-[var(--paper-text-soft)] hover:bg-[rgba(84,63,39,0.08)]'}`}
                >
                  All Categories
                </button>
                {DEFAULT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setFilters({ ...filters, category: cat.id }); setCategoryOpen(false) }}
                    className={`flex w-full items-center space-x-3 px-4 py-3 transition-colors ${filters.category === cat.id ? 'bg-[rgba(84,63,39,0.08)]' : 'hover:bg-[rgba(84,63,39,0.08)]'}`}
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

        <div>
          <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">Type</label>
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

        <div>
          <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
            style={{
              color: filters.startDate ? 'var(--paper-text)' : 'var(--paper-text-soft)',
              WebkitTextFillColor: filters.startDate ? 'var(--paper-text)' : 'var(--paper-text-soft)',
            }}
          />
        </div>

        <div>
          <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-[1.2rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
            style={{
              color: filters.endDate ? 'var(--paper-text)' : 'var(--paper-text-soft)',
              WebkitTextFillColor: filters.endDate ? 'var(--paper-text)' : 'var(--paper-text-soft)',
            }}
          />
        </div>
      </div>

      {(filters.search || filters.category || filters.startDate || filters.endDate || filters.type) && (
        <button
          onClick={() => { setFilters({}); setSearchInput('') }}
          className="mt-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
