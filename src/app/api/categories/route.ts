import { NextResponse } from 'next/server'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

export async function GET() {
  return NextResponse.json({ categories: DEFAULT_CATEGORIES })
}
