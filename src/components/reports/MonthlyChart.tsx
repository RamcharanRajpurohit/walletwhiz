'use client'

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import { useTransactions } from '@/context/TransactionContext'
import { formatCurrency } from '@/utils/formatters'

export default function MonthlyChart() {
  const { monthlyBreakdown } = useTransactions()
  const chartTheme = {
    line: 'var(--chart-accent)',
    grid: 'var(--chart-grid)',
    tick: 'var(--chart-tick)',
    tooltipBg: 'var(--chart-tooltip-bg)',
    tooltipBorder: 'var(--chart-tooltip-border)',
    tooltipText: 'var(--chart-tooltip-text)',
    cursor: 'var(--chart-cursor)',
  }

  const chartData = monthlyBreakdown.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    total: item.total,
  }))

  const totals = chartData.map(item => item.total)
  const minTotal = totals.length ? Math.min(...totals) : 0
  const maxTotal = totals.length ? Math.max(...totals) : 0
  const spread = maxTotal - minTotal
  const padding = (spread || maxTotal || 1) * 0.14
  const domainMin = Math.max(0, minTotal - padding)
  const domainMax = maxTotal + padding

  return (
    <div className="paper-card relative rounded-[2rem] p-6">
      <p className="section-kicker">Cadence</p>
      <h2 className="mt-2 text-2xl text-[var(--paper-text)]">Monthly spending trend</h2>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-[var(--paper-text-soft)]">No data available</p>
        </div>
      ) : (
        <div className="mt-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 14, right: 24, bottom: 8, left: 18 }}>
              <defs>
                <linearGradient id="monthlySoft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.line} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={chartTheme.line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeDasharray="2 8" />
              <XAxis
                dataKey="month"
                padding={{ left: 14, right: 14 }}
                tick={{ fontSize: 11, fill: chartTheme.tick }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={64}
                domain={[domainMin, domainMax]}
                tick={{ fontSize: 11, fill: chartTheme.tick }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number | string) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Month: ${label}`}
                cursor={{ fill: chartTheme.cursor }}
                contentStyle={{
                  borderRadius: '1rem',
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  background: chartTheme.tooltipBg,
                  color: chartTheme.tooltipText,
                  boxShadow: '0 18px 36px rgba(47, 34, 22, 0.12)',
                  padding: '10px 12px',
                }}
                labelStyle={{ color: chartTheme.tooltipText, fontWeight: 700, marginBottom: 6 }}
                itemStyle={{ color: chartTheme.tooltipText, fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="total" fill="url(#monthlySoft)" stroke="none" />
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartTheme.line}
                strokeWidth={3}
                dot={{ fill: chartTheme.line, r: 4 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
