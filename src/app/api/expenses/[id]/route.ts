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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const result = await fetchBackendWithSession<{ data?: BackendRecord }>(buildBackendUrl(`/records/${id}`), {
      method: 'PATCH',
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

    const response = NextResponse.json({
      expense: mapRecordToExpense(result.payload?.data as BackendRecord),
    })

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('PUT /api/expenses/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const result = await fetchBackendWithSession<{ data?: { id: string; deleted: boolean } }>(
      buildBackendUrl(`/records/${id}`),
      {
        method: 'DELETE',
      }
    )

    if (!result.ok) return buildFailureResponse(result)

    const response = NextResponse.json(result.payload?.data ?? { success: true })

    if (result.refreshedTokens) {
      setAuthCookies(response, result.refreshedTokens)
    }

    return response
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
