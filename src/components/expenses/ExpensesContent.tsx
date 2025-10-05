'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ExpenseList from './ExpenseList'
import ExpenseFilters from './ExpenseFilters'
import ExpenseModal from './ExpenseModal'
import { ExpenseFilters as FilterType } from '@/types/expense'

export default function ExpensesContent({ userId }: { userId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterType>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
          <p className="text-gray-600">Track and manage your expenses</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
      
      <ExpenseList 
        filters={filters} 
        refreshKey={refreshKey}
        onUpdate={() => setRefreshKey(prev => prev + 1)}
      />

      {isModalOpen && (
        <ExpenseModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleExpenseAdded}
        />
      )}
    </div>
  )
}
