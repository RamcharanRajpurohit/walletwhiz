import { NextRequest, NextResponse } from 'next/server'
import { buildBackendUrl, clearAuthCookies, fetchBackendWithSession, setAuthCookies } from '@/lib/backend'

type Period = 'day' | 'week' | 'month'

type BackendRecord = {
  id: string
  amount: number
  category: string
  type: 'income' | 'expense'
  occurredAt: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: { id?: string } | null
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function periodRange(period: Period) {
  const now = new Date()

  if (period === 'day') {
    const start = startOfDay(now)
    const end = endOfDay(now)
    const prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 1)
    const prevEnd = new Date(end)
    prevEnd.setDate(prevEnd.getDate() - 1)
    return { start, end, prevStart, prevEnd }
  }

  if (period === 'week') {
    const start = startOfDay(new Date(now))
    const weekday = start.getDay()
    const diffToMonday = weekday === 0 ? -6 : 1 - weekday
    start.setDate(start.getDate() + diffToMonday)
    const end = endOfDay(new Date(start))
    end.setDate(end.getDate() + 6)
    const prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 7)
    const prevEnd = new Date(end)
    prevEnd.setDate(prevEnd.getDate() - 7)
    return { start, end, prevStart, prevEnd }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
  return { start, end, prevStart, prevEnd }
}

function mapRecordToExpense(record: BackendRecord) {
  return {
    _id: record.id,
    userId: record.createdBy?.id ?? '',
    amount: record.amount,
    category: record.category,
    type: record.type,
    date: record.occurredAt,
    note: record.notes ?? '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function formatDailyLabel(label: string, period: Period) {
  const date = new Date(label)

  if (Number.isNaN(date.getTime())) {
    return label
  }

  if (period === 'day') {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(date)
  }

  if (period === 'week') {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
  }

  return `${date.getDate()}`
}

type OverviewData = {
  totals?: { totalExpenses?: number; totalIncome?: number; netBalance?: number; totalRecords?: number }
  categoryTotals?: { category: string; totalAmount: number; count: number }[]
  trends?: { label: string; expense: number; income?: number; netBalance?: number; recordCount: number }[]
  recentActivity?: BackendRecord[]
}

async function fetchOverview(params: URLSearchParams) {
  const result = await fetchBackendWithSession<{ data?: OverviewData }>(
    buildBackendUrl('/dashboard/overview', params)
  )

  if (!result.ok) {
    const response = NextResponse.json(
      { message: result.message ?? 'Failed to load dashboard data' },
      { status: result.status }
    )

    if (result.clearAuth) {
      clearAuthCookies(response)
    }

    return {
      error: response,
      data: null,
      refreshedTokens: undefined,
    }
  }

  return {
    error: null,
    data: result.payload?.data ?? null,
    refreshedTokens: result.refreshedTokens,
  }
}

export async function GET(request: NextRequest) {
  try {
    const period = (request.nextUrl.searchParams.get('period') ?? 'month') as Period
    const recentLimit = request.nextUrl.searchParams.get('recentLimit') ?? '5'
    const { start, end, prevStart, prevEnd } = periodRange(period)

    const currentParams = new URLSearchParams({
      trend: period === 'day' ? 'hourly' : 'daily',
      recentLimit,
      from: start.toISOString(),
      to: end.toISOString(),
    })

    const previousParams = new URLSearchParams({
      trend: 'daily',
      recentLimit: '1',
      from: prevStart.toISOString(),
      to: prevEnd.toISOString(),
    })

    const [current, previous] = await Promise.all([
      fetchOverview(currentParams),
      fetchOverview(previousParams),
    ])

    if (current.error) return current.error
    if (previous.error) return previous.error

    const currentData = current.data
    const previousData = previous.data
    const spent = currentData?.totals?.totalExpenses ?? 0
    const income = currentData?.totals?.totalIncome ?? 0
    const expenseCount = (currentData?.categoryTotals ?? []).reduce(
      (sum: number, item: { count: number }) => sum + item.count,
      0
    )

    const categories = (currentData?.categoryTotals ?? []).map((item: { category: string; totalAmount: number; count: number }) => ({
      category: item.category,
      total: item.totalAmount,
      count: item.count,
      percentage: spent > 0 ? (item.totalAmount / spent) * 100 : 0,
    }))

    const timeSeries = (currentData?.trends ?? []).map((item: { label: string; expense: number; income?: number; netBalance?: number; recordCount: number }) => ({
      label: formatDailyLabel(item.label, period),
      total: item.expense,
      income: item.income ?? 0,
      balance: item.netBalance ?? (item.income ?? 0) - item.expense,
      count: item.recordCount,
    }))

    const response = NextResponse.json({
      period,
      stats: {
        spent,
        income,
        balance: currentData?.totals?.netBalance ?? income - spent,
        txCount: currentData?.totals?.totalRecords ?? 0,
        avgExpense: expenseCount > 0 ? spent / expenseCount : 0,
      },
      prev: {
        spent: previousData?.totals?.totalExpenses ?? 0,
        income: previousData?.totals?.totalIncome ?? 0,
      },
      timeSeries,
      categories,
      recentTransactions: (currentData?.recentActivity ?? []).map((item: BackendRecord) => mapRecordToExpense(item)),
    })

    const refreshedTokens = current.refreshedTokens ?? previous.refreshedTokens
    if (refreshedTokens) {
      setAuthCookies(response, refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
