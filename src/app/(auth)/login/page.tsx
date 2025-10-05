import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Expense Tracker',
  description: 'Sign in to your expense tracker account',
}

export default function LoginPage() {
  return <LoginForm />
}