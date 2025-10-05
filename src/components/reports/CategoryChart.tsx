'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
interface CategoryData {
  category: string
  total: number
  count: number
  percentage: number
}

interface CategoryChartProps {
  data: CategoryData[]
}


export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map(item => {
    const category = DEFAULT_CATEGORIES.find(c => c.id === item.category)
    return {
      name: category?.name || item.category,
      value: item.total,
      color: category?.color || '#64748b',
    }
  })

  return (
    <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name}) => `${name}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | string) => `₹${Number(value).toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}