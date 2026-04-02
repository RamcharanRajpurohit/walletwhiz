'use client'

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useTransactions } from '@/context/TransactionContext'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

function delta(current: number, prev: number): { pct: number; up: boolean } | null {
  if (prev === 0) return null
  const pct = ((current - prev) / prev) * 100
  return { pct: Math.abs(pct), up: pct > 0 }
}

function Delta({ current, prev, inverse = false }: { current: number; prev: number; inverse?: boolean }) {
  const d = delta(current, prev)
  if (!d) return null
  const bad = inverse ? d.up : !d.up
  return (
    <span className={`flex items-center text-xs font-medium ${bad ? 'text-rose-500' : 'text-green-500'}`}>
      {d.up ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
      {d.pct.toFixed(1)}% vs prev
    </span>
  )
}

const PERIOD_LABELS = { day: 'Today', week: 'This Week', month: 'This Month' }

export default function DashboardContent() {
  const { recentTransactions, loadingReports, period, setPeriod, dashboardData, loadingDashboard } = useTransactions()

  const getCategoryInfo = (id: string) =>
    DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]

  const periodLabel = PERIOD_LABELS[period]
  const loading = loadingDashboard
  const data = dashboardData

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Overview</p>
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          {(['day', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p
                  ? 'bg-gradient-to-r from-yellow-400 to-rose-400 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/90 border-2 border-yellow-200/50 rounded-2xl p-5 shadow-lg animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Balance */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-5 shadow-lg col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">Balance · {periodLabel}</p>
              <div className={`p-2 rounded-xl ${data.stats.balance >= 0 ? 'bg-green-100' : 'bg-rose-100'}`}>
                <DollarSign className={`h-4 w-4 ${data.stats.balance >= 0 ? 'text-green-600' : 'text-rose-600'}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${data.stats.balance >= 0 ? 'text-green-700' : 'text-rose-700'}`}>
              {formatCurrency(data.stats.balance)}
            </p>
          </div>

          {/* Income */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">Income · {periodLabel}</p>
              <div className="p-2 bg-green-100 rounded-xl">
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.income)}</p>
            <Delta current={data.stats.income} prev={data.prev.income} />
          </div>

          {/* Spent */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">Spent · {periodLabel}</p>
              <div className="p-2 bg-rose-100 rounded-xl">
                <ArrowDownCircle className="h-4 w-4 text-rose-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.spent)}</p>
            <Delta current={data.stats.spent} prev={data.prev.spent} inverse />
          </div>

          {/* Transactions + avg */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">Transactions · {periodLabel}</p>
              <div className="p-2 bg-purple-100 rounded-xl">
                <Receipt className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.txCount}</p>
            <span className="text-xs text-gray-400">avg {formatCurrency(data.stats.avgExpense)}</span>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend over time — takes 2 cols */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <h2 className="text-base font-bold text-gray-900 mb-5">Spending over time</h2>
          {loading ? (
            <div className="h-56 bg-gray-100 animate-pulse rounded-xl" />
          ) : data?.timeSeries.length ? (
            <ResponsiveContainer width="100%" height={220}>
              {period === 'month' ? (
                <AreaChart data={data.timeSeries}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={l => `Day ${l}`} />
                  <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={data.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400">No spending data for this period</div>
          )}
        </div>

        {/* Category breakdown — 1 col */}
        <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
          <h2 className="text-base font-bold text-gray-900 mb-5">Top categories · {periodLabel}</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : data?.categories.length ? (
            <div className="space-y-3">
              {data.categories.map(item => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <cat.icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{cat.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
            <p className="text-gray-400 text-sm text-center mt-8">No expenses this period</p>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white/90 backdrop-blur-md border-2 border-yellow-200/50 rounded-2xl p-6 shadow-lg">
        <h2 className="text-base font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {loadingReports ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />)}
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTransactions.map(tx => {
              const cat = getCategoryInfo(tx.category)
              const isIncome = tx.type === 'income'
              return (
                <div key={tx._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-rose-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{tx.note}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap ml-2 ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
