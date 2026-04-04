'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { Expense, ExpenseFilters } from '@/types/expense'
import { useAuth } from '@/context/AuthContext'
import { canAccessAnalytics, canReadRecords } from '@/types/auth'
import {
  createTempExpenseId,
  ExpenseMutationInput,
  isTempExpenseId,
  normalizeExpenseMutationInput,
  queueCreateExpenseMutation,
  queueDeleteExpenseMutation,
  queueUpdateExpenseMutation,
  requestExpenseQueueSync,
} from '@/lib/offline/expense-queue'
import { toast } from 'sonner'

export type Period = 'day' | 'week' | 'month'

interface DashboardData {
  period: Period
  stats: { spent: number; income: number; balance: number; txCount: number; avgExpense: number }
  prev: { spent: number; income: number }
  timeSeries: { label: string; total: number; income: number; balance: number; count: number }[]
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

function isNetworkFailure(error: unknown) {
  if (!navigator.onLine) {
    return true
  }

  return error instanceof TypeError
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user, loading: loadingUser } = useAuth()
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

  const buildOptimisticExpense = useCallback((id: string, input: ExpenseMutationInput) => {
    const normalized = normalizeExpenseMutationInput(input)

    return {
      _id: id,
      userId: user?.id ?? 'offline',
      amount: normalized.amount,
      category: normalized.category,
      type: normalized.type,
      date: normalized.date,
      note: normalized.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Expense
  }, [user?.id])

  const applyOptimisticUpdate = useCallback((id: string, input: ExpenseMutationInput) => {
    const normalized = normalizeExpenseMutationInput(input)

    setTransactions((prev) => prev.map((item) => {
      if (item._id !== id) {
        return item
      }

      return {
        ...item,
        amount: normalized.amount,
        category: normalized.category,
        type: normalized.type,
        date: normalized.date,
        note: normalized.note,
        updatedAt: new Date().toISOString(),
      } as unknown as Expense
    }))

    setRecentTransactions((prev) => prev.map((item) => {
      if (item._id !== id) {
        return item
      }

      return {
        ...item,
        amount: normalized.amount,
        category: normalized.category,
        type: normalized.type,
        date: normalized.date,
        note: normalized.note,
        updatedAt: new Date().toISOString(),
      } as unknown as Expense
    }))
  }, [])

  const applyOptimisticDelete = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((item) => item._id !== id))
    setRecentTransactions((prev) => prev.filter((item) => item._id !== id))
    setPagination((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        total: Math.max(0, prev.total - 1),
      }
    })
  }, [])

  const applyIdReplacements = useCallback((replacements: Array<{ tempId: string; realId: string }>) => {
    if (!replacements.length) {
      return
    }

    const replacementMap = new Map(replacements.map((item) => [item.tempId, item.realId]))

    setTransactions((prev) => prev.map((item) => {
      if (!item._id) {
        return item
      }

      const realId = replacementMap.get(item._id)
      if (!realId) {
        return item
      }

      return {
        ...item,
        _id: realId,
      }
    }))

    setRecentTransactions((prev) => prev.map((item) => {
      if (!item._id) {
        return item
      }

      const realId = replacementMap.get(item._id)
      if (!realId) {
        return item
      }

      return {
        ...item,
        _id: realId,
      }
    }))
  }, [])

  const fetchPage = useCallback(async (activeFilters: ExpenseFilters, page: number) => {
    if (!canReadRecords(user?.role ?? null)) {
      setTransactions([])
      setPagination(null)
      setLoadingTransactions(false)
      return
    }

    setLoadingTransactions(true)
    try {
      const params = buildParams(activeFilters, page)
      const res = await fetch(`/api/expenses?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message)
      setTransactions(data.expenses || [])
      setPagination(data.pagination || null)
    } catch {
      toast.error('Failed to load transactions')
    } finally {
      setLoadingTransactions(false)
    }
  }, [user?.role])

  const fetchReports = useCallback(async () => {
    if (!canAccessAnalytics(user?.role ?? null)) {
      setReportStats(null)
      setCategoryBreakdown([])
      setMonthlyBreakdown([])
      setLoadingReports(false)
      return
    }

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
  }, [user?.role])

  const fetchDashboard = useCallback(async (p: Period, force = false) => {
    if (!user) {
      setDashboardData(null)
      setRecentTransactions([])
      setLoadingDashboard(false)
      return
    }

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
      setRecentTransactions(json.recentTransactions || [])
    } catch {
      // silent
    } finally {
      setLoadingDashboard(false)
    }
  }, [user])

  const setPeriod = useCallback((p: Period) => {
    setPeriodState(p)
    fetchDashboard(p)
  }, [fetchDashboard])

  useEffect(() => {
    if (loadingUser) return

    if (!user) {
      setTransactions([])
      setRecentTransactions([])
      setReportStats(null)
      setCategoryBreakdown([])
      setMonthlyBreakdown([])
      setPagination(null)
      setDashboardData(null)
      setLoadingTransactions(false)
      setLoadingReports(false)
      setLoadingDashboard(false)
      return
    }

    void fetchDashboard('month')

    if (canReadRecords(user.role)) {
      void fetchPage({}, 1)
    } else {
      setTransactions([])
      setPagination(null)
      setLoadingTransactions(false)
    }

    if (canAccessAnalytics(user.role)) {
      void fetchReports()
    } else {
      setReportStats(null)
      setCategoryBreakdown([])
      setMonthlyBreakdown([])
      setLoadingReports(false)
    }
  }, [fetchDashboard, fetchPage, fetchReports, loadingUser, user])

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
    const tasks: Promise<void>[] = [fetchDashboard(period, true)]
    if (canReadRecords(user?.role ?? null)) tasks.push(fetchPage(filters, page))
    if (canAccessAnalytics(user?.role ?? null)) tasks.push(fetchReports())
    await Promise.all(tasks)
  }, [fetchDashboard, fetchPage, fetchReports, filters, pagination, period, user?.role])

  useEffect(() => {
    const handleOnline = () => {
      void requestExpenseQueueSync()
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') {
        return
      }

      if (data.type === 'WALLETWHIZ_QUEUE_SYNCED') {
        const replacements = Array.isArray(data.replacements)
          ? (data.replacements as unknown[]).filter((item): item is { tempId: string; realId: string } =>
              Boolean(item && typeof (item as Record<string, unknown>).tempId === 'string' && typeof (item as Record<string, unknown>).realId === 'string')
            )
          : []

        applyIdReplacements(replacements)

        if (typeof data.processed === 'number' && data.processed > 0) {
          toast.success(`Synced ${data.processed} offline change${data.processed === 1 ? '' : 's'}`)
        }

        void refresh()
      }
    }

    window.addEventListener('online', handleOnline)
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)

    return () => {
      window.removeEventListener('online', handleOnline)
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
    }
  }, [applyIdReplacements, refresh])

  const addTransaction = useCallback(async (
    data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    const queueOfflineCreate = async () => {
      const tempId = createTempExpenseId()
      const optimisticExpense = buildOptimisticExpense(tempId, data)

      setTransactions((prev) => [optimisticExpense, ...prev].slice(0, PAGE_SIZE))
      setRecentTransactions((prev) => [optimisticExpense, ...prev].slice(0, 5))
      setPagination((prev) => {
        if (!prev) {
          return prev
        }

        return {
          ...prev,
          total: prev.total + 1,
        }
      })

      dashboardCache.current = {}

      try {
        await queueCreateExpenseMutation(tempId, data)
        await requestExpenseQueueSync()
        toast.success('Saved offline. Will sync automatically.')
        return true
      } catch {
        setTransactions((prev) => prev.filter((item) => item._id !== tempId))
        setRecentTransactions((prev) => prev.filter((item) => item._id !== tempId))
        toast.error('Failed to save offline transaction')
        return false
      }
    }

    if (!navigator.onLine) {
      return queueOfflineCreate()
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null)
        throw new Error(errorPayload?.message ?? 'Failed to add transaction')
      }

      const { expense } = await res.json()

      setRecentTransactions(prev => [expense, ...prev].slice(0, 5))
      dashboardCache.current = {}
      await fetchPage(filters, 1)
      void fetchReports()
      void fetchDashboard(period, true)
      return true
    } catch (error) {
      if (isNetworkFailure(error)) {
        return queueOfflineCreate()
      }

      toast.error(error instanceof Error ? error.message : 'Failed to add transaction')
      return false
    }
  }, [buildOptimisticExpense, filters, period, fetchPage, fetchReports, fetchDashboard])

  const updateTransaction = useCallback(async (
    id: string,
    data: Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    const queueOfflineUpdate = async () => {
      applyOptimisticUpdate(id, data)
      dashboardCache.current = {}

      try {
        await queueUpdateExpenseMutation(id, data)
        await requestExpenseQueueSync()
        toast.success('Update queued for sync')
        return true
      } catch {
        toast.error('Failed to queue offline update')
        return false
      }
    }

    if (isTempExpenseId(id) || !navigator.onLine) {
      return queueOfflineUpdate()
    }

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null)
        throw new Error(errorPayload?.message ?? 'Failed to update transaction')
      }

      const { expense: updated } = await res.json()

      setTransactions(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t))
      setRecentTransactions(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t))
      dashboardCache.current = {}
      void fetchReports()
      void fetchDashboard(period, true)
      return true
    } catch (error) {
      if (isNetworkFailure(error)) {
        return queueOfflineUpdate()
      }

      toast.error(error instanceof Error ? error.message : 'Failed to update transaction')
      return false
    }
  }, [applyOptimisticUpdate, period, fetchReports, fetchDashboard])

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    const queueOfflineDelete = async () => {
      const previousTransactions = transactions
      const previousRecentTransactions = recentTransactions

      applyOptimisticDelete(id)
      dashboardCache.current = {}

      try {
        await queueDeleteExpenseMutation(id)
        await requestExpenseQueueSync()
        toast.success('Delete queued for sync')
        return true
      } catch {
        setTransactions(previousTransactions)
        setRecentTransactions(previousRecentTransactions)
        toast.error('Failed to queue offline delete')
        return false
      }
    }

    if (isTempExpenseId(id) || !navigator.onLine) {
      return queueOfflineDelete()
    }

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null)
        throw new Error(errorPayload?.message ?? 'Failed to delete transaction')
      }

      setRecentTransactions(prev => prev.filter(t => t._id !== id))

      dashboardCache.current = {}
      const page = pagination?.page ?? 1
      await fetchPage(filters, page)
      void fetchReports()
      void fetchDashboard(period, true)
      return true
    } catch (error) {
      if (isNetworkFailure(error)) {
        return queueOfflineDelete()
      }

      toast.error(error instanceof Error ? error.message : 'Failed to delete transaction')
      return false
    }
  }, [applyOptimisticDelete, filters, pagination, period, fetchPage, fetchReports, fetchDashboard, recentTransactions, transactions])

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
