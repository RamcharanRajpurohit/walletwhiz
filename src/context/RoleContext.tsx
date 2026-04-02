'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Role = 'admin' | 'viewer'

interface RoleContextType {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType>({ role: 'admin', setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin')

  useEffect(() => {
    const saved = localStorage.getItem('walletwhiz_role') as Role | null
    if (saved === 'admin' || saved === 'viewer') setRoleState(saved)
  }, [])

  const setRole = (newRole: Role) => {
    setRoleState(newRole)
    localStorage.setItem('walletwhiz_role', newRole)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export const useRole = () => useContext(RoleContext)
