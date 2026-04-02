import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { connectDB } from '@/lib/mongodb/connection'
import { ExpenseModel } from '@/lib/mongodb/models'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    // Single aggregation pipeline — all computation in MongoDB, nothing in Node
    const [result] = await ExpenseModel.aggregate([
      { $match: { userId } },
      {
        $facet: {
          // Overall stats split by type
          stats: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          // Category breakdown for expenses only
          categoryBreakdown: [
            { $match: { type: { $in: ['expense', null] } } },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
          // Monthly breakdown for expenses only (last 12 months)
          monthlyBreakdown: [
            { $match: { type: { $in: ['expense', null] } } },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' },
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ],
        },
      },
    ])

    // Build stats from facet result
    let totalSpent = 0
    let totalIncome = 0
    let expenseCount = 0
    let expenseOnlyCount = 0

    for (const s of result.stats) {
      if (s._id === 'income') {
        totalIncome += s.total
        expenseCount += s.count
      } else {
        // 'expense' or null (legacy records without type)
        totalSpent += s.total
        expenseOnlyCount += s.count
        expenseCount += s.count
      }
    }

    // Compute category percentages
    const categoryBreakdown = result.categoryBreakdown.map((c: { _id: string; total: number; count: number }) => ({
      category: c._id,
      total: c.total,
      count: c.count,
      percentage: totalSpent > 0 ? (c.total / totalSpent) * 100 : 0,
    }))

    // Format monthly breakdown
    const monthlyBreakdown = result.monthlyBreakdown.map((m: { _id: { year: number; month: number }; total: number; count: number }) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      total: m.total,
      count: m.count,
    }))

    return NextResponse.json({
      stats: {
        totalSpent,
        totalIncome,
        totalBalance: totalIncome - totalSpent,
        expenseCount,
        averageExpense: expenseOnlyCount > 0 ? totalSpent / expenseOnlyCount : 0,
      },
      categoryBreakdown,
      monthlyBreakdown,
    })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
