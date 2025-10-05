'use client'

import { Search, Calendar } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { ExpenseFilters as FilterType } from '@/types/expense'

interface ExpenseFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: FilterType) => void
}

export default function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-2 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </div>

      {(filters.search || filters.category || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onFiltersChange({})}
          className="mt-4 text-sm text-rose-600 hover:text-rose-700 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

