import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { connectDB } from '@/lib/mongodb/connection'
import { ExpenseModel } from '@/lib/mongodb/models'

const PAGE_SIZE = 25

interface MongoQuery {
  userId: string
  category?: string
  type?: string
  note?: { $regex: string; $options: string }
  date?: { $gte?: Date; $lte?: Date }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    // Simple limit mode (for recent transactions widget)
    const limit = searchParams.get('limit')
    // Paginated mode
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || String(PAGE_SIZE), 10)

    const query: MongoQuery = { userId: session.user.id }

    if (category) query.category = category
    if (type) query.type = type
    if (search) {
      query.note = { $regex: search, $options: 'i' }
    }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    // Simple limit mode — used for recent widget, no pagination
    if (limit) {
      const expenses = await ExpenseModel
        .find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit, 10))
        .lean()
      return NextResponse.json({ expenses })
    }

    // Paginated mode — run count and data in parallel
    const skip = (page - 1) * pageSize
    const [expenses, total] = await Promise.all([
      ExpenseModel.find(query).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
      ExpenseModel.countDocuments(query),
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + expenses.length < total,
      },
    })
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, category, type, date, note } = body

    if (!amount || !category || !date || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    const expense = await ExpenseModel.create({
      userId: session.user.id,
      amount: Number(amount),
      category,
      type: type || 'expense',
      date: new Date(date),
      note,
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
