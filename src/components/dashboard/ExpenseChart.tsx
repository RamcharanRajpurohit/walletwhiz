'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ExpenseChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const res = await fetch('/api/reports')
      const data = await res.json()
      setChartData(data.categoryBreakdown || [])
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}