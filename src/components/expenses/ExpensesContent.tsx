'use client'

import ExpenseList from './ExpenseList'
import ExpenseFilters from './ExpenseFilters'

export default function ExpensesContent() {
  return (
    <div className="space-y-6 overflow-x-hidden">
      <ExpenseFilters />

      <ExpenseList />
    </div>
  )
}
