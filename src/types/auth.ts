export type UserRole = 'viewer' | 'analyst' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
}

export const DEMO_ROLE_ACCOUNTS: Record<UserRole, { email: string; password: string; label: string }> = {
  admin: {
    email: 'admin@walletwhiz.dev',
    password: 'password123',
    label: 'Admin',
  },
  analyst: {
    email: 'analyst@walletwhiz.dev',
    password: 'password123',
    label: 'Analyst',
  },
  viewer: {
    email: 'viewer@walletwhiz.dev',
    password: 'password123',
    label: 'Viewer',
  },
}

export function canReadRecords(role: UserRole | null) {
  return role === 'admin' || role === 'analyst'
}

export function canManageRecords(role: UserRole | null) {
  return role === 'admin'
}

export function canAccessAnalytics(role: UserRole | null) {
  return role === 'admin' || role === 'analyst'
}

export function canAccessPath(role: UserRole | null, pathname: string) {
  if (!role) return false
  if (pathname === '/dashboard') return true
  if (pathname === '/expenses') return canReadRecords(role)
  if (pathname === '/reports') return canAccessAnalytics(role)
  if (pathname === '/insights') return canAccessAnalytics(role)
  return true
}
