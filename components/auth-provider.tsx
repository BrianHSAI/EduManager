'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/database'
import { User as AppUser } from '@/lib/types'

interface AuthContextType {
  user: AppUser | null
  supabaseUser: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: { name: string; role: 'teacher' | 'student' }) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        getCurrentUser().then(setUser)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        const appUser = await getCurrentUser()
        setUser(appUser)
        
        // Redirect based on user role after successful auth
        if (appUser && window.location.pathname === '/login') {
          if (appUser.role === 'teacher') {
            window.location.href = '/teacher'
          } else {
            window.location.href = '/student'
          }
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: 'teacher' | 'student' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) return { error }

    // Create user profile in our users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: email,
          name: userData.name,
          role: userData.role
        }])

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        return { error: profileError }
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
