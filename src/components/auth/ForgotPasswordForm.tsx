'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success('Password reset email sent!')
    }  catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
  setError(errorMessage)
  toast.error('Failed to send reset email')
} finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We&apos;ve sent password reset instructions to <strong>{email}</strong>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to login</span>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">Enter your email to receive reset instructions</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            className={`block w-full pl-10 pr-3 py-4 border-2 ${
              error ? 'border-rose-300' : 'border-yellow-200'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-lg`}
            placeholder="Enter your email"
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-rose-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-400 to-rose-400 hover:from-yellow-500 hover:to-rose-500 text-white text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to login</span>
        </Link>
      </div>
    </form>
  )
}