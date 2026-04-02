'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { Expense, ExpenseFilters } from '@/types/expense'
import { toast } from 'sonner'

export type Period = 'day' | 'week' | 'month'

interface DashboardData {
  period: Period
  stats: { spent: number; income: number; balance: number; txCount: number; avgExpense: number }
  prev: { spent: number; income: number }
  timeSeries: { label: string; total: number; count: number }[]
  categories: { category: string; total: number; count: number; percentage: number }[]
}

interface CategoryBreakdown {
  category: string
  total: number
  count: number
  percentage: number
}

interface MonthlyBreakdown {
  month: string
  total: number
  count: number
}

interface ReportStats {
  totalSpent: number
  totalIncome: number
  totalBalance: number
  expenseCount: number
  averageExpense: number
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface TransactionContextType {
  transactions: Expense[]
  recentTransactions: Expense[]
  reportStats: ReportStats | null
  categoryBreakdown: CategoryBreakdown[]
  monthlyBreakdown: MonthlyBreakdown[]
  pagination: Pagination | null

  loadingTransactions: boolean
  loadingReports: boolean

  period: Period
  setPeriod: (p: Period) => void
  dashboardData: DashboardData | null
  loadingDashboard: boolean

  filters: ExpenseFilters
  setFilters: (filters: ExpenseFilters) => void

  goToPage: (page: number) => Promise<void>
  fetchReports: () => Promise<void>
  addTransaction: (data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updateTransaction: (id: string, data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | null>(null)

export const PAGE_SIZE = 25

function buildParams(filters: ExpenseFilters, page: number): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.search) params.append('search', filters.search)
  if (filters.type) params.append('type', filters.type)
  params.append('page', String(page))
  params.append('pageSize', String(PAGE_SIZE))
  return params
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([])
  const [reportStats, setReportStats] = useState<ReportStats | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [filters, setFiltersState] = useState<ExpenseFilters>({})
  const [period, setPeriodState] = useState<Period>('month')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const dashboardCache = useRef<Partial<Record<Period, DashboardData>>>({})

  const fetchPage = useCallback(async (activeFilters: ExpenseFilters, page: number) => {
    setLoadingTransactions(true)
    try {
      const params = buildParams(activeFilters, page)
      const res = await fetch(`/api/expenses?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTransactions(data.expenses || [])
      setPagination(data.pagination || null)
    } catch {
      toast.error('Failed to load transactions')
    } finally {
      setLoadingTransactions(false)
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const res = await fetch('/api/reports')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReportStats(data.stats || null)
      setCategoryBreakdown(data.categoryBreakdown || [])
      setMonthlyBreakdown(data.monthlyBreakdown || [])
    } catch {
      toast.error('Failed to load report data')
    } finally {
      setLoadingReports(false)
    }
  }, [])

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses?limit=5')
      if (!res.ok) return
      const data = await res.json()
      setRecentTransactions(data.expenses || [])
    } catch { /* silent */ }
  }, [])

  const fetchDashboard = useCallback(async (p: Period, force = false) => {
    if (!force && dashboardCache.current[p]) {
      setDashboardData(dashboardCache.current[p]!)
      setLoadingDashboard(false)
      return
    }
    setLoadingDashboard(true)
    try {
      const res = await fetch(`/api/dashboard?period=${p}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      dashboardCache.current[p] = json
      setDashboardData(json)
    } catch {
      // silent
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  const setPeriod = useCallback((p: Period) => {
    setPeriodState(p)
    fetchDashboard(p)
  }, [fetchDashboard])

  useEffect(() => {
    fetchPage({}, 1)
    fetchReports()
    fetchRecent()
    fetchDashboard('month')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setFilters = useCallback((newFilters: ExpenseFilters) => {
    setFiltersState(newFilters)
    fetchPage(newFilters, 1) // reset to page 1 on filter change
  }, [fetchPage])

  const goToPage = useCallback(async (page: number) => {
    await fetchPage(filters, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters, fetchPage])

  const refresh = useCallback(async () => {
    const page = pagination?.page ?? 1
    await Promise.all([fetchPage(filters, page), fetchReports(), fetchRecent()])
  }, [filters, pagination, fetchPage, fetchReports, fetchRecent])

  const addTransaction = useCallback(async (
    data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const { expense } = await res.json()

      setRecentTransactions(prev => [expense, ...prev].slice(0, 5))
      dashboardCache.current = {}
      await fetchPage(filters, 1)
      fetchReports()
      fetchDashboard(period)
      return true
    } catch {
      toast.error('Failed to add transaction')
      return false
    }
  }, [filters, period, fetchPage, fetchReports, fetchDashboard])

  const updateTransaction = useCallback(async (
    id: string,
    data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const { expense: updated } = await res.json()

      setTransactions(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t))
      setRecentTransactions(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t))
      dashboardCache.current = {}
      fetchReports()
      fetchDashboard(period)
      return true
    } catch {
      toast.error('Failed to update transaction')
      return false
    }
  }, [period, fetchReports, fetchDashboard])

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      setRecentTransactions(prev => prev.filter(t => t._id !== id))

      dashboardCache.current = {}
      const page = pagination?.page ?? 1
      await fetchPage(filters, page)
      fetchReports()
      fetchDashboard(period)
      return true
    } catch {
      toast.error('Failed to delete transaction')
      return false
    }
  }, [filters, pagination, period, fetchPage, fetchReports, fetchDashboard])

  return (
    <TransactionContext.Provider value={{
      transactions,
      recentTransactions,
      reportStats,
      categoryBreakdown,
      monthlyBreakdown,
      pagination,
      loadingTransactions,
      loadingReports,
      period,
      setPeriod,
      dashboardData,
      loadingDashboard,
      filters,
      setFilters,
      goToPage,
      fetchReports,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refresh,
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used inside TransactionProvider')
  return ctx
}
