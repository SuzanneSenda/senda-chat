'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/lib/supabase/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isConfigured: boolean
  signOut: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PROFILE_STORAGE_KEY = 'senda_profile'

// Helper to get cached profile from localStorage (used for initial render only)
function getCachedProfile(): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Cache used for initial render, but always refresh from server
      // Keep cache valid for 24 hours as fallback
      if (parsed.timestamp && Date.now() - parsed.timestamp < 86400000) {
        return parsed.profile
      }
    }
  } catch (e) {
    console.log('Error reading cached profile:', e)
  }
  return null
}

// Helper to cache profile in localStorage
function setCachedProfile(profile: Profile | null) {
  if (typeof window === 'undefined') return
  try {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        profile,
        timestamp: Date.now()
      }))
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    }
  } catch (e) {
    console.log('Error caching profile:', e)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() => getCachedProfile())
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured')
      setLoading(false)
      setIsConfigured(false)
      return
    }
    
    setIsConfigured(true)

    // Timeout to prevent infinite loading (increased to 15s)
    const timeout = setTimeout(() => {
      console.log('Auth timeout - forcing loading to false')
      setLoading(false)
    }, 15000)

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          clearTimeout(timeout)
          return
        }
        
        console.log('Session:', session ? 'exists' : 'none')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('getSession exception:', err)
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setCachedProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, retryCount = 0) => {
    if (!supabase) {
      console.log('fetchProfile: supabase client is null')
      return
    }
    
    try {
      console.log('fetchProfile: fetching for userId', userId, 'attempt', retryCount + 1)
      
      // Use maybeSingle() instead of single() to avoid errors
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('fetchProfile result:', { data, error })

      if (error) {
        console.error('Error fetching profile:', error)
        // Retry up to 2 times
        if (retryCount < 2) {
          console.log('Retrying fetchProfile in 1 second...')
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000)
        }
        return
      }

      if (data) {
        const newProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role || 'voluntario',
          status: data.status || 'active',
          avatar_url: data.avatar_url,
          phone: data.phone,
          created_at: data.created_at,
          updated_at: data.updated_at,
          last_sign_in: null
        } as Profile
        // Always update state with fresh data from server (overrides cache)
        setProfile(newProfile)
        setCachedProfile(newProfile)
        console.log('fetchProfile: profile updated from server, role:', data.role)
      } else {
        console.log('fetchProfile: no profile found for user')
        // Retry if no data
        if (retryCount < 2) {
          console.log('Retrying fetchProfile in 1 second...')
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000)
        }
      }
    } catch (err) {
      console.error('Exception fetching profile:', err)
      // Retry on exception
      if (retryCount < 2) {
        console.log('Retrying fetchProfile in 1 second...')
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1000)
      }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCachedProfile(null)
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('refreshProfile: forcing refresh from server')
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isConfigured, signOut, hasRole, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role hierarchy helper
export const roleHierarchy: Record<UserRole, number> = {
  supervisor: 3,
  admin: 2,
  voluntario: 1,
}

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
