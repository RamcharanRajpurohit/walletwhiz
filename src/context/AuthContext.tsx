'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthUser, DEMO_ROLE_ACCOUNTS, UserRole } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  authError: boolean
  isAuthenticated: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: UserRole) => Promise<{ ok: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const cached = localStorage.getItem('ww_user')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  const refresh = useCallback(async () => {
    // If offline and we have session cookies, skip the network call
    // and stay in whatever state we're in (user already set or initial load)
    if (!navigator.onLine) {
      const hasSession = document.cookie.includes('walletwhiz_access_token') || document.cookie.includes('walletwhiz_refresh_token')
      if (hasSession) {
        // Trust cookies — don't clear user or set error
        return
      }
      // No cookies offline = not logged in
      setUser(null)
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUser(null)
        } else {
          setAuthError(true)
        }
        return
      }

      setAuthError(false)
      const data = await res.json()
      const freshUser = data.user ?? null
      setUser(freshUser)
      try {
        if (freshUser) localStorage.setItem('ww_user', JSON.stringify(freshUser))
        else localStorage.removeItem('ww_user')
      } catch { /* ignore */ }
    } catch {
      // Network error while supposedly online — treat as backend down
      const hasSession = document.cookie.includes('walletwhiz_access_token') || document.cookie.includes('walletwhiz_refresh_token')
      if (hasSession) {
        setAuthError(true)
      } else {
        setUser(null)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      setAuthError(false)
      try { localStorage.removeItem('ww_user') } catch { /* ignore */ }
    }
  }, [])

  const switchRole = useCallback(async (role: UserRole) => {
    const account = DEMO_ROLE_ACCOUNTS[role]

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        return { ok: false, message: data?.message ?? 'Failed to switch account' }
      }

      setUser(data?.user ?? null)
      return { ok: true }
    } catch {
      return { ok: false, message: 'Failed to switch account' }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await refresh()
      setLoading(false)
    }

    void load()
  }, [refresh])

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
    switchRole,
  }), [loading, authError, refresh, logout, switchRole, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
