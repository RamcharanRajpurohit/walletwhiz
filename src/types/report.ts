export interface CategorySummary {
  category: string
  total: number
  count: number
  percentage: number
}

export interface MonthlySummary {
  month: string
  total: number
  count: number
}

export interface ReportData {
  totalSpent: number
  expenseCount: number
  averageExpense: number
  categoryBreakdown: CategorySummary[]
  monthlyBreakdown: MonthlySummary[]
}