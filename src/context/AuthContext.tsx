'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthUser, DEMO_ROLE_ACCOUNTS, UserRole } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: UserRole) => Promise<{ ok: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUser(null)
        }
        return
      }

      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      // Keep the current user during transient network or backend issues.
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      setUser(null)
    }
  }, [])

  const switchRole = useCallback(async (role: UserRole) => {
    const account = DEMO_ROLE_ACCOUNTS[role]

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        return {
          ok: false,
          message: data?.message ?? 'Failed to switch account',
        }
      }

      setUser(data?.user ?? null)
      return { ok: true }
    } catch {
      return {
        ok: false,
        message: 'Failed to switch account',
      }
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
    isAuthenticated: Boolean(user),
    refresh,
    logout,
    switchRole,
  }), [loading, refresh, logout, switchRole, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
