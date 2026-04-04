'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  WalletCards,
  BadgeIndianRupee,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useTransactions } from '@/context/TransactionContext'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

const CADENCE_CHART = {
  expense: 'var(--danger)',
  income: 'var(--success)',
  grid: 'var(--chart-grid)',
  tick: 'var(--chart-tick)',
  tooltipBg: 'var(--chart-tooltip-bg)',
  tooltipBorder: 'var(--chart-tooltip-border)',
  tooltipText: 'var(--chart-tooltip-text)',
  cursor: 'var(--chart-cursor)',
}

function delta(current: number, prev: number): { pct: number; up: boolean } | null {
  if (prev === 0) return null
  const pct = ((current - prev) / prev) * 100
  return { pct: Math.abs(pct), up: pct > 0 }
}

function Delta({ current, prev, inverse = false }: { current: number; prev: number; inverse?: boolean }) {
  const d = delta(current, prev)

  if (!d) {
    return <span className="text-xs font-medium text-[var(--text-muted)]">Fresh period baseline</span>
  }

  const bad = inverse ? d.up : !d.up

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${bad ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
      {d.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {d.pct.toFixed(1)}% vs previous window
    </span>
  )
}

const PERIOD_LABELS = { day: 'Today', week: 'This Week', month: 'This Month' } as const

function StatBlock({
  label,
  value,
  icon: Icon,
  deltaNode,
  tone = 'light',
}: {
  label: string
  value: string | number
  icon: typeof Receipt
  deltaNode?: React.ReactNode
  tone?: 'light' | 'dark' | 'paper'
}) {
  const isDark = tone === 'dark'
  const isPaper = tone === 'paper'

  return (
    <div className={
      isDark
        ? 'rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-5'
        : isPaper
          ? 'rounded-[1.8rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] p-5'
          : 'metric-card p-5'
    }>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-[rgba(255,250,241,0.52)]' : isPaper ? 'text-[var(--paper-muted)]' : 'text-[var(--text-muted)]'}`}>
            {label}
          </p>
          <p className={`mt-3 text-2xl font-semibold leading-none md:text-[1.95rem] ${isDark ? 'text-[var(--surface)]' : isPaper ? 'text-[var(--paper-text)]' : 'text-[var(--text-base)]'}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${isDark ? 'bg-[rgba(255,255,255,0.08)] text-[var(--surface)]' : isPaper ? 'bg-[var(--paper-surface-muted)] text-[var(--accent)]' : 'bg-[var(--surface-muted)] text-[var(--accent)]'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {deltaNode ? <div className="mt-4">{deltaNode}</div> : null}
    </div>
  )
}

export default function DashboardContent() {
  const { recentTransactions, period, setPeriod, dashboardData, loadingDashboard } = useTransactions()

  const cadenceSeries = useMemo(() => {
    if (!dashboardData) {
      return []
    }

    if (period !== 'day') {
      return dashboardData.timeSeries
    }

    const indexed = new Map(dashboardData.timeSeries.map((item) => [item.label, item]))

    return Array.from({ length: 24 }, (_, hour) => {
      const label = new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(new Date(2026, 0, 1, hour, 0, 0, 0))
      const point = indexed.get(label)

      return point ?? {
        label,
        total: 0,
        income: 0,
        balance: 0,
        count: 0,
      }
    })
  }, [dashboardData, period])

  const getCategoryInfo = (id: string) =>
    DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]

  const periodLabel = PERIOD_LABELS[period]
  const loading = loadingDashboard
  const data = dashboardData
  const leadCategory = data?.categories?.[0]

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
        {loading ? (
          <>
            <div className="paper-card animate-pulse rounded-[2rem] p-7">
              <div className="h-3 w-28 rounded-full bg-[var(--paper-surface-muted-strong)]" />
              <div className="mt-5 h-14 w-3/4 rounded-2xl bg-[var(--paper-surface-muted-strong)]" />
              <div className="mt-3 h-4 w-2/3 rounded-full bg-[var(--paper-surface-muted-strong)]" />
            </div>
            <div className="grid gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="metric-card animate-pulse p-5">
                  <div className="h-3 w-20 rounded-full bg-[var(--surface-muted)]" />
                  <div className="mt-4 h-9 w-1/2 rounded-2xl bg-[var(--surface-muted)]" />
                </div>
              ))}
            </div>
          </>
        ) : data ? (
          <>
            <div className="paper-card rounded-[2rem] p-6 md:p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <span className="editorial-pill">
                    Balance Sheet
                  </span>
                  <h3 className="mt-5 font-display text-[2.25rem] leading-[0.95] text-[var(--paper-text)] md:text-[3.4rem]">
                    {formatCurrency(data.stats.balance)}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--paper-text-soft)]">
                    {data.stats.balance >= 0
                      ? `You are carrying a healthy net position for ${periodLabel.toLowerCase()}.`
                      : `Outflow is currently ahead of income for ${periodLabel.toLowerCase()}, so this period needs attention.`}
                  </p>
                </div>

                <div className="premium-tabs">
                  {(['day', 'week', 'month'] as const).map(p => (
                    <button
                      key={p}
                      data-active={period === p}
                      onClick={() => setPeriod(p)}
                      className="premium-tab"
                    >
                      {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <StatBlock
                  label={`Income · ${periodLabel}`}
                  value={formatCurrency(data.stats.income)}
                  icon={ArrowUpCircle}
                  deltaNode={<Delta current={data.stats.income} prev={data.prev.income} />}
                  tone="paper"
                />
                <StatBlock
                  label={`Spent · ${periodLabel}`}
                  value={formatCurrency(data.stats.spent)}
                  icon={ArrowDownCircle}
                  deltaNode={<Delta current={data.stats.spent} prev={data.prev.spent} inverse />}
                  tone="paper"
                />
              </div>
            </div>

            <div className="grid gap-5">
              <StatBlock
                label={`Entries · ${periodLabel}`}
                value={data.stats.txCount}
                icon={WalletCards}
                deltaNode={<span className="text-xs font-medium text-[var(--text-muted)]">Average expense {formatCurrency(data.stats.avgExpense)}</span>}
              />
              <div className="metric-card p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Lead Category
                </p>
                {leadCategory ? (
                  <div className="mt-4 flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[1rem]"
                      style={{ backgroundColor: `${getCategoryInfo(leadCategory.category).color}20` }}
                    >
                      {(() => {
                        const category = getCategoryInfo(leadCategory.category)
                        const Icon = category.icon
                        return <Icon className="h-5 w-5" style={{ color: category.color }} />
                      })()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-base)]">{getCategoryInfo(leadCategory.category).name}</p>
                      <p className="mt-1 text-sm text-[var(--text-soft)]">
                        {formatCurrency(leadCategory.total)} and {leadCategory.percentage.toFixed(1)}% of spend
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--text-soft)]">No category pressure detected for this period yet.</p>
                )}
              </div>
              <div className="metric-card p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Reading
                </p>
                <p className="mt-4 text-lg font-semibold text-[var(--text-base)]">
                  {data.stats.spent > data.stats.income ? 'Spending is outrunning inflow.' : 'Inflow is supporting the month well.'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                  Use the ledger and report views to inspect where that pressure is coming from before it compounds.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
        <div className="paper-card relative rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Spending Cadence</p>
              <h3 className="mt-2 text-2xl text-[var(--paper-text)]">How this period is unfolding</h3>
              {period === 'day' ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--paper-text-soft)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                    Income (right axis)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
                    Expense (left axis)
                  </span>
                </div>
              ) : null}
            </div>
            <span className="editorial-pill hidden md:inline-flex">{periodLabel}</span>
          </div>

          {loading ? (
            <div className="mt-6 h-64 animate-pulse rounded-[1.5rem] bg-[var(--paper-surface-muted)]" />
          ) : cadenceSeries.length ? (
            <div className="mt-6 h-[255px]">
              <ResponsiveContainer width="100%" height="100%">
                {period === 'month' ? (
                  <AreaChart data={cadenceSeries}>
                    <defs>
                      <linearGradient id="journalSpendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CADENCE_CHART.expense} stopOpacity={0.34} />
                        <stop offset="100%" stopColor={CADENCE_CHART.expense} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={CADENCE_CHART.grid} strokeDasharray="2 8" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CADENCE_CHART.tick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: CADENCE_CHART.tick }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      labelFormatter={l => `Day ${l}`}
                      cursor={{ fill: CADENCE_CHART.cursor }}
                      contentStyle={{
                        borderRadius: '1rem',
                        border: `1px solid ${CADENCE_CHART.tooltipBorder}`,
                        background: CADENCE_CHART.tooltipBg,
                        color: CADENCE_CHART.tooltipText,
                        boxShadow: '0 18px 36px rgba(47, 34, 22, 0.12)',
                      }}
                    />
                    <Area type="monotone" dataKey="total" stroke={CADENCE_CHART.expense} strokeWidth={2.4} fill="url(#journalSpendGrad)" dot={false} />
                  </AreaChart>
                ) : period === 'day' ? (
                  <ComposedChart data={cadenceSeries} barCategoryGap="36%">
                    <CartesianGrid vertical={false} stroke={CADENCE_CHART.grid} strokeDasharray="2 8" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CADENCE_CHART.tick }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis
                      yAxisId="expense"
                      tick={{ fontSize: 11, fill: CADENCE_CHART.tick }}
                      axisLine={false}
                      tickLine={false}
                      width={54}
                      tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="income"
                      orientation="right"
                      tick={{ fontSize: 11, fill: CADENCE_CHART.income }}
                      axisLine={false}
                      tickLine={false}
                      width={54}
                      tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
                      labelFormatter={(label) => `${label}`}
                      cursor={{ fill: CADENCE_CHART.cursor }}
                      contentStyle={{
                        borderRadius: '1rem',
                        border: `1px solid ${CADENCE_CHART.tooltipBorder}`,
                        background: CADENCE_CHART.tooltipBg,
                        color: CADENCE_CHART.tooltipText,
                        boxShadow: '0 18px 36px rgba(47, 34, 22, 0.12)',
                      }}
                    />
                    <Bar
                      yAxisId="expense"
                      dataKey="total"
                      fill={CADENCE_CHART.expense}
                      stroke="var(--paper-border)"
                      strokeWidth={1}
                      radius={[8, 8, 3, 3]}
                      maxBarSize={18}
                      minPointSize={3}
                    />
                    <Line
                      yAxisId="income"
                      type="linear"
                      dataKey="income"
                      stroke={CADENCE_CHART.income}
                      strokeWidth={2.4}
                      dot={{ r: 2, strokeWidth: 0, fill: CADENCE_CHART.income }}
                      activeDot={{ r: 4, fill: CADENCE_CHART.income }}
                    />
                  </ComposedChart>
                ) : (
                  <BarChart data={cadenceSeries}>
                    <CartesianGrid vertical={false} stroke={CADENCE_CHART.grid} strokeDasharray="2 8" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CADENCE_CHART.tick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: CADENCE_CHART.tick }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      cursor={{ fill: CADENCE_CHART.cursor }}
                      contentStyle={{
                        borderRadius: '1rem',
                        border: `1px solid ${CADENCE_CHART.tooltipBorder}`,
                        background: CADENCE_CHART.tooltipBg,
                        color: CADENCE_CHART.tooltipText,
                        boxShadow: '0 18px 36px rgba(47, 34, 22, 0.12)',
                      }}
                    />
                    <Bar dataKey="total" fill={CADENCE_CHART.expense} radius={[12, 12, 3, 3]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex h-64 items-center justify-center rounded-[1.5rem] bg-[var(--paper-surface-muted)] text-sm text-[var(--paper-text-soft)]">
              No spending data for this period
            </div>
          )}
        </div>

        <div className="metric-card rounded-[2rem] p-6">
          <p className="section-kicker">Category Pressure</p>
          <h3 className="mt-2 text-2xl text-[var(--text-base)]">Where the money is concentrating</h3>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 animate-pulse rounded-[1rem] bg-[var(--surface-muted)]" />)}
            </div>
          ) : data?.categories.length ? (
            <div className="mt-6 space-y-4">
              {data.categories.slice(0, 4).map(item => {
                const cat = getCategoryInfo(item.category)

                return (
                  <div key={item.category} className="rounded-[1.3rem] border border-[var(--border-col)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem]"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text-base)]">{cat.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{item.count} entries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--text-base)]">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 flex h-64 items-center justify-center rounded-[1.5rem] bg-[var(--surface-muted)] text-sm text-[var(--text-soft)]">
              No expense concentration to show yet
            </div>
          )}
        </div>
      </section>

      <section className="paper-card relative rounded-[2rem] p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Recent Ledger</p>
            <h3 className="mt-2 text-2xl text-[var(--paper-text)]">The latest entries, written clearly</h3>
          </div>
          <span className="editorial-pill hidden md:inline-flex">
            <BadgeIndianRupee className="h-3.5 w-3.5" />
            Live feed
          </span>
        </div>

        {loadingDashboard ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 animate-pulse rounded-[1.4rem] bg-[var(--paper-surface-muted)]" />)}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="mt-6 flex h-44 items-center justify-center rounded-[1.5rem] bg-[var(--paper-surface-muted)] text-sm text-[var(--paper-text-soft)]">
            No transactions yet
          </div>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {recentTransactions.map(tx => {
              const cat = getCategoryInfo(tx.category)
              const isIncome = tx.type === 'income'

              return (
                <div
                  key={tx._id}
                  className="rounded-[1.5rem] border border-[var(--paper-border)] bg-[var(--paper-card-strong)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem]" style={{ backgroundColor: `${cat.color}20` }}>
                        <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--paper-text)]">{tx.note}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--paper-text-soft)]">
                          <span>{cat.name}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`whitespace-nowrap text-sm font-semibold ${isIncome ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
