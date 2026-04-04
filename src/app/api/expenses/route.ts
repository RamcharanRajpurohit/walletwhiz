import { NextRequest, NextResponse } from 'next/server'
import { buildBackendUrl, clearAuthCookies, fetchBackendWithSession, setAuthCookies } from '@/lib/backend'

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

function buildFailureResponse(result: { status: number; message: string; clearAuth?: boolean }) {
  const response = NextResponse.json({ message: result.message }, { status: result.status })

  if (result.clearAuth) {
    clearAuthCookies(response)
  }

  return response
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    if (limit) {
      const params = new URLSearchParams({
        trend: 'monthly',
        recentLimit: limit,
      })

      const result = await fetchBackendWithSession<{ data?: { recentActivity?: BackendRecord[] } }>(
        buildBackendUrl('/dashboard/overview', params)
      )
      if (!result.ok) return buildFailureResponse(result)

      const response = NextResponse.json({
        expenses: (result.payload?.data?.recentActivity ?? []).map(mapRecordToExpense),
      })

      if (result.refreshedTokens) {
        setAuthCookies(response, result.refreshedTokens)
      }

      return response
    }

    const backendParams = new URLSearchParams({
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('pageSize') ?? '25',
    })

    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const type = searchParams.get('type')

    if (category) backendParams.set('category', category)
    if (startDate) backendParams.set('from', startDate)
    if (endDate) backendParams.set('to', endDate)
    if (search) backendParams.set('search', search)
    if (type) backendParams.set('type', type)

    const result = await fetchBackendWithSession<{
      data?: {
        items?: BackendRecord[]
        pagination?: { page: number; limit: number; total: number; totalPages: number }
      }
    }>(buildBackendUrl('/records', backendParams))
    if (!result.ok) return buildFailureResponse(result)

    const items = result.payload?.data?.items ?? []
    const pagination = result.payload?.data?.pagination

    const response = NextResponse.json({
      expenses: items.map((item: BackendRecord) => mapRecordToExpense(item)),
      pagination: pagination
        ? {
            page: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
            hasMore: pagination.page < pagination.totalPages,
          }
        : null,
    })

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await fetchBackendWithSession<{ data?: BackendRecord }>(buildBackendUrl('/records'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: body.amount,
        category: body.category,
        type: body.type ?? 'expense',
        occurredAt: body.date,
        notes: body.note,
      }),
    })

    if (!result.ok) return buildFailureResponse(result)

    const response = NextResponse.json(
      { expense: mapRecordToExpense(result.payload?.data as BackendRecord) },
      { status: 201 }
    )

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
