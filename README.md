# WalletWhiz

A personal finance dashboard built with Next.js — tracking income, expenses, and spending patterns with offline support and role-based access.

## Live

[https://zorvyn-weld.vercel.app](https://zorvyn-weld.vercel.app)

**Demo accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@walletwhiz.dev` | `password123` |
| Analyst | `analyst@walletwhiz.dev` | `password123` |
| Viewer | `viewer@walletwhiz.dev` | `password123` |

## Features

- **Dashboard** — balance sheet, income vs spend, spending cadence chart, category pressure, recent ledger
- **Expenses ledger** — paginated transaction list with sort, search, category, type, and date filters
- **Reports** — monthly breakdown and category distribution charts
- **Insights** — signals and readings based on spending patterns
- **Role-based access** — Admin can add/edit/delete, Analyst can read records, Viewer gets dashboard only
- **Offline support** — mutations queue in IndexedDB when offline and sync automatically when back online; cached user session persists across offline first loads
- **PWA** — installable on mobile, service worker caches pages and API responses
- **Dark mode** — manual toggle, persisted across sessions

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Service Worker + IndexedDB (offline queue)
- JWT auth via httpOnly cookies (managed by backend)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
BACKEND_API_URL=https://zorvyn-fl9b.vercel.app/api/v1
```

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

The frontend uses a BFF (Backend for Frontend) pattern — all `/api/*` routes are Next.js server-side proxy handlers that forward requests to the backend and manage auth cookies. The browser never communicates with the backend directly.

```
Browser → Next.js /api/* → Backend API
```

Offline mutations (create, update, delete) are queued in IndexedDB by the service worker and flushed via Background Sync when connectivity is restored. The user session is cached in localStorage so the app loads correctly even on first open while offline.

## Project Structure

```
src/
  app/
    (app)/          # protected dashboard routes
    (auth)/         # login, signup, password reset
    api/            # BFF proxy handlers
  components/
    dashboard/      # balance sheet, charts, recent ledger
    expenses/       # list, filters, modal
    layout/         # header, sidebar, bottom nav
    reports/        # monthly and category charts
    insights/       # signals content
  context/
    AuthContext         # user session, offline-aware refresh
    TransactionContext  # data fetching and state
    ThemeContext        # dark/light mode
  hooks/
    useOfflineQueueStatus  # pending count and sync state
  lib/
    backend.ts      # fetch wrapper with token refresh
    offline/        # IndexedDB queue helpers
  types/
    auth.ts         # roles, permissions, demo accounts
```
