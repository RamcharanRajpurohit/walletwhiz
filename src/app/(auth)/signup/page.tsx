import { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up - Expense Tracker',
  description: 'Create your expense tracker account',
}

export default function SignupPage() {
  return <SignupForm />
}


