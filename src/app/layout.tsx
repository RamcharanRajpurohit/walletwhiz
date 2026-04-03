import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
export const metadata: Metadata = {
  title: 'WalletWhiz - Personal Finance Tracker',
  description: 'Track your daily expenses, categorize spending, and gain insights into your financial habits.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WalletWhiz',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="WalletWhiz" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WalletWhiz" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        {/* Runs before React hydrates — prevents theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('walletwhiz_theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning>
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