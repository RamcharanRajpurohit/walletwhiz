'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  const applyTheme = (t: Theme) => {
    document.documentElement.classList.toggle('dark', t === 'dark')
    const color = t === 'dark' ? '#111111' : '#ffffff'
    document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.setAttribute('content', color))
  }

  useEffect(() => {
    const saved = localStorage.getItem('walletwhiz_theme') as Theme | null
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(preferred)
    applyTheme(preferred)
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('walletwhiz_theme', next)
    applyTheme(next)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
