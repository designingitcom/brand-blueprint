'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err)
        setError(err as AuthError)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      setSession(session)
      setUser(session?.user ?? null)
      setError(null)
      setLoading(false)

      // Handle specific events
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        setError(error)
      }
    } catch (err) {
      console.error('Unexpected error signing out:', err)
      setError(err as AuthError)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        setError(error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
    } catch (err) {
      console.error('Unexpected error refreshing session:', err)
      setError(err as AuthError)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}