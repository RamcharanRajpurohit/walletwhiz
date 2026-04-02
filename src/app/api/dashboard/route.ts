import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { connectDB } from '@/lib/mongodb/connection'
import { ExpenseModel } from '@/lib/mongodb/models'

function periodRange(period: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  let start: Date, end: Date, prevStart: Date, prevEnd: Date

  if (period === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1)
    prevEnd   = new Date(end);   prevEnd.setDate(prevEnd.getDate() - 1)
  } else if (period === 'week') {
    const day = now.getDay() // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day)
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0)
    end   = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59)
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7)
    prevEnd   = new Date(end);   prevEnd.setDate(prevEnd.getDate() - 7)
  } else {
    // month
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
    prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  }
  return { start, end, prevStart, prevEnd }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const userId = session.user.id
    const period = request.nextUrl.searchParams.get('period') || 'month'
    const { start, end, prevStart, prevEnd } = periodRange(period)

    // Group key for time-series depends on period
    const groupId =
      period === 'day'
        ? { hour: { $hour: '$date' } }
        : period === 'week'
        ? { dayOfWeek: { $dayOfWeek: '$date' }, day: { $dayOfMonth: '$date' }, month: { $month: '$date' } }
        : { day: { $dayOfMonth: '$date' }, month: { $month: '$date' } }

    const [result] = await ExpenseModel.aggregate([
      { $match: { userId } },
      {
        $facet: {
          // Current period stats
          current: [
            { $match: { date: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          // Previous period stats (for delta)
          previous: [
            { $match: { date: { $gte: prevStart, $lte: prevEnd } } },
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          // Time-series breakdown (expenses only, current period)
          timeSeries: [
            { $match: { date: { $gte: start, $lte: end }, type: { $in: ['expense', null] } } },
            {
              $group: {
                _id: groupId,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.dayOfWeek': 1 } },
          ],
          // Category breakdown (expenses only, current period)
          categories: [
            { $match: { date: { $gte: start, $lte: end }, type: { $in: ['expense', null] } } },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
            { $limit: 8 },
          ],
        },
      },
    ])

    // Build current stats
    let spent = 0, income = 0, txCount = 0
    for (const s of result.current) {
      if (s._id === 'income') { income += s.total; txCount += s.count }
      else { spent += s.total; txCount += s.count }
    }

    // Build previous stats
    let prevSpent = 0, prevIncome = 0
    for (const s of result.previous) {
      if (s._id === 'income') prevIncome += s.total
      else prevSpent += s.total
    }

    // Format time-series labels
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const timeSeries = result.timeSeries.map((t: { _id: Record<string, number>; total: number; count: number }) => {
      let label = ''
      if (period === 'day') {
        const h = t._id.hour
        label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
      } else if (period === 'week') {
        label = DAY_NAMES[(t._id.dayOfWeek - 1 + 7) % 7] // MongoDB dayOfWeek: 1=Sun
      } else {
        label = `${t._id.day}`
      }
      return { label, total: t.total, count: t.count }
    })

    // Fill gaps for week (show all 7 days even if 0)
    let filledTimeSeries = timeSeries
    if (period === 'week') {
      filledTimeSeries = DAY_NAMES.map(d => timeSeries.find((t: { label: string }) => t.label === d) || { label: d, total: 0, count: 0 })
    }

    const categories = result.categories.map((c: { _id: string; total: number; count: number }) => ({
      category: c._id,
      total: c.total,
      count: c.count,
      percentage: spent > 0 ? (c.total / spent) * 100 : 0,
    }))

    return NextResponse.json({
      period,
      range: { start, end },
      stats: {
        spent,
        income,
        balance: income - spent,
        txCount,
        avgExpense: txCount > 0 ? spent / txCount : 0,
      },
      prev: { spent: prevSpent, income: prevIncome },
      timeSeries: filledTimeSeries,
      categories,
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
