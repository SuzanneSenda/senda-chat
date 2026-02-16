'use client'

import { useAuth, hasMinimumRole } from '@/lib/auth/context'
import type { UserRole } from '@/lib/supabase/database.types'

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  minimumRole?: UserRole
  fallback?: React.ReactNode
}

/**
 * Gate component for role-based access control
 * 
 * Usage:
 * <RoleGate allowedRoles={['supervisor', 'admin']}>
 *   <AdminOnlyContent />
 * </RoleGate>
 * 
 * Or with minimum role hierarchy:
 * <RoleGate minimumRole="admin">
 *   <AdminAndAboveContent />
 * </RoleGate>
 */
export function RoleGate({ 
  children, 
  allowedRoles, 
  minimumRole, 
  fallback = null 
}: RoleGateProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!profile) {
    return <>{fallback}</>
  }

  // Check by specific roles
  if (allowedRoles) {
    if (!allowedRoles.includes(profile.role)) {
      return <>{fallback}</>
    }
  }

  // Check by minimum role in hierarchy
  if (minimumRole) {
    if (!hasMinimumRole(profile.role, minimumRole)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Hook for checking role access in component logic
 */
export function useRoleAccess() {
  const { profile } = useAuth()

  return {
    isSupervisor: profile?.role === 'supervisor',
    isAdmin: profile?.role === 'admin' || profile?.role === 'supervisor',
    isVoluntario: profile?.role === 'voluntario',
    canEditContent: profile?.role === 'supervisor' || profile?.role === 'admin',
    canManageUsers: profile?.role === 'supervisor' || profile?.role === 'admin',
    canAccessChat: profile?.role === 'supervisor' || profile?.role === 'voluntario',
    canViewAllChats: profile?.role === 'supervisor',
  }
}
