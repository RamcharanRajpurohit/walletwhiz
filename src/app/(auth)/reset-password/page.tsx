import { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password - Expense Tracker',
  description: 'Create a new password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
