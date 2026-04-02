# WalletWhiz — Finance Dashboard

A full-stack finance dashboard for tracking income, expenses, and spending patterns — built as part of a frontend engineering assignment.

## Live Demo

[https://walletwhiz-eight.vercel.app/dashboard](https://walletwhiz-eight.vercel.app/dashboard)

**Demo credentials:**
- Email: `test@gmail.com`
- Password: `password`

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Supabase project (for auth)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MONGODB_URI=your_mongodb_connection_string
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed Sample Data (optional)

Populates 1000 realistic transactions across 3 months:

```bash
npm run seed -- --userId <your-user-id>
```

---

## How It Meets the Requirements

### 1. Dashboard Overview
- **Summary cards**: Balance, Income, Spent, Transaction count — each with delta vs previous period
- **Period switcher**: Day / Week / Month — all cards and charts update accordingly
- **Time-based chart**: Area chart (month) or Bar chart (day/week) showing spend over time
- **Category chart**: Color-coded breakdown with progress bars scoped to the selected period

### 2. Transactions Section
- Paginated list (25 per page) with date, amount, category, and income/expense type badges
- Filter by category, type, date range, and keyword search
- Sort by date or amount (ascending/descending)
- Add / Edit / Delete (Admin role only)

### 3. Role-Based UI
Toggle between **Admin** and **Viewer** using the buttons in the header. No login required to switch — it's a frontend simulation.

| Action | Admin | Viewer |
|--------|-------|--------|
| View all data | Yes | Yes |
| Add transaction | Yes | No |
| Edit transaction | Yes | No |
| Delete transaction | Yes | No |
| Category filter (income) | Disabled | Disabled |

Role is persisted in `localStorage` across sessions.

### 4. Insights Section
- Top spending category (amount + % of total)
- Most frequent category (by transaction count)
- Month-over-month spending comparison (% change with trend indicator)
- Average daily spend for the current month
- Full category breakdown table with rankings and progress bars
- Last 6 months trend chart

### 5. State Management
All state lives in `TransactionContext` (React Context API):
- Transactions list with server-side pagination
- Active filters (category, type, date range, search)
- Pagination state
- Reports data (stats, category breakdown, monthly breakdown)
- Dashboard period (Day/Week/Month) with per-period cache
- Selected role in `RoleContext` with localStorage persistence

Mutations (add/update/delete) invalidate the dashboard cache and re-fetch fresh data automatically.

---

## Technical Approach

### Performance at Scale
- **Server-side pagination** — constant 25 rows in memory regardless of dataset size
- **MongoDB compound indexes** on `(userId, date)`, `(userId, type, date)`, `(userId, category, date)` for fast filtered queries
- **`$facet` aggregation** — single DB round-trip returns stats, categories, and time-series together
- **Dashboard cache** — period data cached in a `useRef` map; switching Day→Week→Month is instant after first load; cache invalidated on any mutation

### Tab Navigation
Tab switching is fully client-side using `pushState` + `popstate` — no server round-trips, no RSC fetches. All four sections (Dashboard, Expenses, Reports, Insights) are mounted once in the shared layout and shown/hidden with CSS.

### Auth
Supabase handles authentication. Route protection is done in `proxy.ts` (Next.js 16 middleware equivalent) — a single edge-runtime check before any page renders.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | Supabase |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context API |
| Notifications | Sonner |

---

## Project Structure

```
src/
  app/
    (auth)/           # Login, signup pages
    (app)/            # Shared shell: Header + Sidebar + providers
  components/
    dashboard/        # DashboardContent, charts
    expenses/         # ExpenseList, ExpenseFilters, ExpenseModal
    reports/          # ReportsContent, CategoryChart, MonthlyChart
    insights/         # InsightsContent
    layout/           # Header, Sidebar
  context/            # TransactionContext, RoleContext
  hooks/              # useClientPath
  lib/                # MongoDB models + indexes, Supabase clients
  types/              # Expense, Category interfaces
  constants/          # Category definitions with Lucide icons
```
