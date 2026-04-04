import { NextResponse } from 'next/server'
import { buildBackendUrl, clearAuthCookies, fetchBackendWithSession, setAuthCookies } from '@/lib/backend'

export async function GET() {
  try {
    const from = new Date()
    from.setMonth(from.getMonth() - 11)
    from.setDate(1)

    const params = new URLSearchParams({
      trend: 'monthly',
      recentLimit: '5',
      from: from.toISOString(),
      to: new Date().toISOString(),
    })

    const result = await fetchBackendWithSession<{
      data?: {
        totals?: { totalExpenses?: number; totalIncome?: number; netBalance?: number }
        categoryTotals?: { category: string; totalAmount: number; count: number }[]
        trends?: { label: string; expense: number; recordCount: number }[]
      }
    }>(buildBackendUrl('/dashboard/overview', params))

    if (!result.ok) {
      const response = NextResponse.json({ message: result.message }, { status: result.status })

      if (result.clearAuth) {
        clearAuthCookies(response)
      }

      return response
    }

    const data = result.payload?.data
    const totalSpent = data?.totals?.totalExpenses ?? 0
    const totalIncome = data?.totals?.totalIncome ?? 0
    const categoryBreakdown = (data?.categoryTotals ?? []).map((item: { category: string; totalAmount: number; count: number }) => ({
      category: item.category,
      total: item.totalAmount,
      count: item.count,
      percentage: totalSpent > 0 ? (item.totalAmount / totalSpent) * 100 : 0,
    }))
    const expenseCount = categoryBreakdown.reduce((sum: number, item: { count: number }) => sum + item.count, 0)
    const monthlyBreakdown = (data?.trends ?? []).map((item: { label: string; expense: number; recordCount: number }) => ({
      month: item.label,
      total: item.expense,
      count: item.recordCount,
    }))

    const response = NextResponse.json({
      stats: {
        totalSpent,
        totalIncome,
        totalBalance: data?.totals?.netBalance ?? totalIncome - totalSpent,
        expenseCount,
        averageExpense: expenseCount > 0 ? totalSpent / expenseCount : 0,
      },
      categoryBreakdown,
      monthlyBreakdown,
    })

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
