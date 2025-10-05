import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { connectDB } from '@/lib/mongodb/connection'
import { ExpenseModel } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
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
    const limit = searchParams.get('limit')

    const query: any = { userId: session.user.id }

    if (category) query.category = category
    if (search) query.note = { $regex: search, $options: 'i' }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    let expenseQuery = ExpenseModel.find(query).sort({ date: -1 })
    
    if (limit) {
      expenseQuery = expenseQuery.limit(parseInt(limit))
    }

    const expenses = await expenseQuery.lean()

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, category, date, note } = body

    if (!amount || !category || !date || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    const expense = await ExpenseModel.create({
      userId: session.user.id,
      amount: Number(amount),
      category,
      date: new Date(date),
      note,
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}