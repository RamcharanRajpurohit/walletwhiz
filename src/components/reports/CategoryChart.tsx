'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { useTransactions } from '@/context/TransactionContext'
import { formatCurrency } from '@/utils/formatters'

export default function CategoryChart() {
  const { categoryBreakdown } = useTransactions()
  const maxVisibleCategories = 4

  const normalizedData = categoryBreakdown
    .map(item => {
      const category = DEFAULT_CATEGORIES.find(c => c.id === item.category)
      return {
        name: category?.name || item.category,
        value: item.total,
        color: category?.color || '#64748b',
      }
    })
    .sort((a, b) => b.value - a.value)

  const topCategories = normalizedData.slice(0, maxVisibleCategories)
  const remainingTotal = normalizedData.slice(maxVisibleCategories).reduce((sum, item) => sum + item.value, 0)

  const chartData = remainingTotal > 0
    ? [...topCategories, { name: 'Others', value: remainingTotal, color: '#9ca3af' }]
    : topCategories

  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  const lead = chartData[0]

  return (
    <div className="paper-card relative rounded-[2rem] p-6">
      <p className="section-kicker">Exposure</p>
      <h2 className="mt-2 text-2xl text-[var(--paper-text)]">Spending by category</h2>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-[var(--paper-text-soft)]">No data available</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="relative h-[260px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 6, right: 12, bottom: 6, left: 12 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="none"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | string) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Category: ${label}`}
                  position={{ x: 12, y: 10 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={{
                    borderRadius: '1rem',
                    border: '1px solid var(--chart-tooltip-border)',
                    background: 'var(--chart-tooltip-bg)',
                    color: 'var(--chart-tooltip-text)',
                    boxShadow: '0 18px 36px rgba(47, 34, 22, 0.12)',
                    padding: '10px 12px',
                  }}
                  wrapperStyle={{ pointerEvents: 'none', zIndex: 20 }}
                  labelStyle={{ color: 'var(--chart-tooltip-text)', fontWeight: 700, marginBottom: 6 }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--paper-muted)]">Total spend</p>
                <p className="mt-2 font-display text-3xl text-[var(--paper-text)]">₹{(total / 1000).toFixed(total >= 100000 ? 0 : 1)}k</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.name} className="rounded-[1.3rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-sm font-semibold text-[var(--paper-text)]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--paper-text)]">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-[var(--paper-muted)]">{total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%</p>
                  </div>
                </div>
              </div>
            ))}

            {lead ? (
              <p className="pt-2 text-sm leading-6 text-[var(--paper-text-soft)]">
                <span className="font-semibold text-[var(--paper-text)]">{lead.name}</span> is currently carrying the heaviest share of expense pressure.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
