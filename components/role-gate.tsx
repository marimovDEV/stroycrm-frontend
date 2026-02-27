import type React from "react"
import type { User } from "@/lib/types"

interface RoleGateProps {
  user: User | null
  allowedRoles: User["role"][]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ user, allowedRoles, children, fallback = null }: RoleGateProps): React.ReactElement | null {
  if (!user || !allowedRoles.includes(user.role)) {
    return (fallback as React.ReactElement | null)
  }

  return <>{children}</>
}
