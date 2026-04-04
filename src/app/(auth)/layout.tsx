import { Sun, TrendingUp, ShieldCheck, BarChart3, Zap, ArrowRight } from 'lucide-react'

const features = [
  { icon: TrendingUp,  title: 'Track Every Rupee',   desc: 'Income and expenses organized by category, date, and type.' },
  { icon: BarChart3,   title: 'Visual Reports',       desc: 'Charts and breakdowns across day, week, and month.' },
  { icon: ShieldCheck, title: 'Role-Based Access',    desc: 'Admin edits, Viewer reads — switch instantly from the header.' },
  { icon: Zap,         title: 'Fast & Responsive',    desc: 'Instant tab switching, cached stats, paginated at scale.' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* Decorative radial glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.12) 0%, transparent 70%)' }} />
      </div>

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-16 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Sun className="h-9 w-9 text-[var(--accent)]" />
          <span className="text-2xl font-bold bg-gradient-to-r from-[var(--text-base)] to-[var(--text-soft)] bg-clip-text text-transparent">
            WalletWhiz
          </span>
        </div>

        {/* Hero text */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-[var(--text-base)] via-[var(--text-base)] to-[var(--text-soft)] bg-clip-text text-transparent">
                Your finances,
              </span>
              <br />
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-transparent">
                finally clear.
              </span>
            </h1>
            <p className="text-[var(--text-soft)] text-lg max-w-sm leading-relaxed">
              A smart dashboard to track every rupee — where it came from, where it went, and what it means.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start space-x-4 group">
                <div className="p-2.5 rounded-xl shrink-0 transition-colors group-hover:brightness-110" style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-col)' }}>
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-base)]">{title}</p>
                  <p className="text-sm text-[var(--text-soft)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center space-x-8 pt-2">
            {[
              { value: '1000+', label: 'Transactions tracked' },
              { value: '8',     label: 'Spending categories' },
              { value: '3',     label: 'Months of insights' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-bold text-[var(--text-base)]">{s.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-[var(--text-muted)]">
          Built for the Zorvyn Finance Dashboard assignment.
        </p>
      </div>

      {/* ── Right panel — auth card ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-14 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center justify-center space-x-3 mb-8 lg:hidden">
            <Sun className="h-8 w-8 text-[var(--accent)]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--text-base)] to-[var(--text-soft)] bg-clip-text text-transparent">
              WalletWhiz
            </span>
          </div>

          <div className="chrome-card rounded-2xl shadow-2xl p-8">
            {children}
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-[var(--text-muted)]">
            <ArrowRight className="h-3 w-3" />
            <span>Demo: test@gmail.com / password</span>
          </div>
        </div>
      </div>

    </div>
  )
}
