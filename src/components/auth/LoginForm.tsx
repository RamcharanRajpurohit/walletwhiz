'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_ROLE_ACCOUNTS, UserRole } from '@/types/auth'

const demoAccounts = Object.entries(DEMO_ROLE_ACCOUNTS) as Array<[UserRole, typeof DEMO_ROLE_ACCOUNTS[UserRole]]>

export default function LoginForm() {
  const [email, setEmail] = useState(demoAccounts[0][1].email)
  const [password, setPassword] = useState(demoAccounts[0][1].password)
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole | null>(demoAccounts[0][0])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to sign in')
      }
      
      toast.success('Welcome back!')
      window.location.href = '/dashboard'
    } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
  toast.error(errorMessage)
} finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-transparent">
        Sign in
      </h2>
      <div className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Demo Accounts</p>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map(([role, account]) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setEmail(account.email)
                setPassword(account.password)
                setSelectedDemoRole(role)
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                selectedDemoRole === role
                  ? 'border-[var(--accent)] bg-[var(--surface-1)] text-[var(--text-base)] ring-1 ring-[var(--accent)]'
                  : 'border-[var(--border-col)] bg-[var(--surface-muted)] text-[var(--text-soft)] hover:border-[var(--accent)] hover:text-[var(--text-base)]'
              }`}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSelectedDemoRole(null)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              className={`block w-full pl-9 pr-3 py-3 border ${errors.email ? 'border-red-700' : 'border-[var(--border-input)]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-[var(--danger)] flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setSelectedDemoRole(null)
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              className={`block w-full pl-9 pr-10 py-3 border ${errors.password ? 'border-red-700' : 'border-[var(--border-input)]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all`}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-soft)]">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-[var(--danger)] flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.password}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] hover:brightness-110 text-white font-medium rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          Self-service sign-up is disabled in this backend demo.
        </p>
      </form>
    </>
  )
}
