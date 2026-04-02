export interface Expense {
  _id?: string
  userId: string
  amount: number
  category: string
  type?: 'income' | 'expense'
  date: Date
  note: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ExpenseFormData {
  amount: string
  category: string
  type: 'income' | 'expense'
  date: string
  note: string
}

export interface ExpenseFilters {
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  type?: 'income' | 'expense' | ''
}
