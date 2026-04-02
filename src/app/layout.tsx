import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
export const metadata: Metadata = {
  title: 'Expense Tracker - Manage Your Personal Finances',
  description: 'Track your daily expenses, categorize spending, and gain insights into your financial habits with our easy-to-use expense tracker.',
  keywords: 'expense tracker, personal finance, budget, money management',
  authors: [{ name: 'Expense Tracker Team' }],
  openGraph: {
    title: 'Expense Tracker - Manage Your Personal Finances',
    description: 'Track and manage your expenses effortlessly',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors duration={1500} />
      </body>
    </html>
  )
}