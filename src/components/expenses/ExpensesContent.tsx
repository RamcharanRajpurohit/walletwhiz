'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ExpenseList from './ExpenseList'
import ExpenseFilters from './ExpenseFilters'
import ExpenseModal from './ExpenseModal'
import { useRole } from '@/context/RoleContext'

export default function ExpensesContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { role } = useRole()

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex justify-end">
        {role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white rounded-xl font-medium transition-all duration-200 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      <ExpenseFilters />

      <ExpenseList />

      {isModalOpen && (
        <ExpenseModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
