import { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - Expense Tracker',
  description: 'Reset your password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}