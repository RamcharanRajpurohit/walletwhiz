import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { connectDB } from '@/lib/mongodb/connection'
import { ExpenseModel } from '@/lib/mongodb/models'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const expenses = await ExpenseModel.find({ userId: session.user.id }).lean()

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const expenseCount = expenses.length
    const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>()
    expenses.forEach(exp => {
      const current = categoryMap.get(exp.category) || { total: 0, count: 0 }
      categoryMap.set(exp.category, {
        total: current.total + exp.amount,
        count: current.count + 1,
      })
    })

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
    }))

    // Monthly breakdown
    const monthMap = new Map<string, { total: number; count: number }>()
    expenses.forEach(exp => {
      const date = new Date(exp.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = monthMap.get(monthKey) || { total: 0, count: 0 }
      monthMap.set(monthKey, {
        total: current.total + exp.amount,
        count: current.count + 1,
      })
    })

    const monthlyBreakdown = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
      }))

    return NextResponse.json({
      stats: {
        totalSpent,
        expenseCount,
        averageExpense,
      },
      categoryBreakdown,
      monthlyBreakdown,
    })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}