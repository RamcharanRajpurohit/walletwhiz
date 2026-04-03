'use client'

import { TrendingUp, TrendingDown, Award, Target, Calendar, BarChart2 } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { useTransactions } from '@/context/TransactionContext'

export default function InsightsContent() {
  const { categoryBreakdown, monthlyBreakdown, loadingReports } = useTransactions()

  if (loadingReports) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  const getCategoryInfo = (id: string) =>
    DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]

  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.total - a.total)
  const topCategory = sortedCategories[0] || null
  const mostFrequent = [...categoryBreakdown].sort((a, b) => b.count - a.count)[0] || null

  const currentMonth = new Date().toISOString().slice(0, 7)
  const prevMonth = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 7)
  })()
  const currentMonthData = monthlyBreakdown.find(m => m.month === currentMonth)
  const prevMonthData = monthlyBreakdown.find(m => m.month === prevMonth)
  const monthlyChange = currentMonthData && prevMonthData && prevMonthData.total > 0
    ? ((currentMonthData.total - prevMonthData.total) / prevMonthData.total) * 100
    : null

  const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const avgDailySpend = currentMonthData ? currentMonthData.total / daysInCurrentMonth : 0

  const sortedMonths = [...monthlyBreakdown].sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="h-5 w-5 text-yellow-500" />
            <p className="text-sm font-medium text-gray-600">Top Spending Category</p>
          </div>
          {topCategory ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                {(() => { const c = getCategoryInfo(topCategory.category); return <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}20` }}><c.icon className="h-4 w-4" style={{ color: c.color }} /></div> })()}
                <p className="text-lg font-bold text-gray-900">{getCategoryInfo(topCategory.category).name}</p>
              </div>
              <p className="text-2xl font-bold text-rose-600">{formatCurrency(topCategory.total)}</p>
              <p className="text-sm text-gray-500 mt-1">{topCategory.percentage.toFixed(1)}% of total</p>
            </>
          ) : (
            <p className="text-gray-400">No data yet</p>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-purple-500" />
            <p className="text-sm font-medium text-gray-600">Most Frequent Category</p>
          </div>
          {mostFrequent ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                {(() => { const c = getCategoryInfo(mostFrequent.category); return <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}20` }}><c.icon className="h-4 w-4" style={{ color: c.color }} /></div> })()}
                <p className="text-lg font-bold text-gray-900">{getCategoryInfo(mostFrequent.category).name}</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{mostFrequent.count} transactions</p>
            </>
          ) : (
            <p className="text-gray-400">No data yet</p>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <p className="text-sm font-medium text-gray-600">vs Last Month</p>
          </div>
          {monthlyChange !== null ? (
            <>
              <div className="flex items-center space-x-2">
                {monthlyChange > 0
                  ? <TrendingUp className="h-6 w-6 text-rose-500" />
                  : <TrendingDown className="h-6 w-6 text-green-500" />
                }
                <p className={`text-2xl font-bold ${monthlyChange > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                  {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">{monthlyChange > 0 ? 'More' : 'Less'} than last month</p>
              <p className="text-xs text-gray-400 mt-1">This month: {formatCurrency(currentMonthData?.total || 0)}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Not enough data for comparison</p>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart2 className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-gray-600">Avg Daily Spend</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgDailySpend)}</p>
          <p className="text-sm text-gray-500 mt-1">This month ({daysInCurrentMonth} days)</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h2>
        {sortedCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expense data available yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map((item, index) => {
              const cat = getCategoryInfo(item.category)
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 shrink-0">#{index + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                    <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{cat.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:inline">{item.count} txns</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.total)}</span>
                        <span className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Monthly Trend</h2>
        {sortedMonths.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No monthly data available yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedMonths.map((item, index) => {
              const maxTotal = Math.max(...sortedMonths.map(m => m.total))
              const widthPct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0
              const label = new Date(item.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
              return (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 sm:w-28 shrink-0 truncate">{label}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        background: index === 0 ? 'linear-gradient(to right, #fbbf24, #f43f5e)' : undefined,
                        backgroundColor: index !== 0 ? '#d1d5db' : undefined,
                      }}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-gray-400">{item.count} txns</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
