'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/database'
import { User as AppUser } from '@/lib/types'
import { addUser } from '@/lib/mock-data'

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
    if (isSupabaseConfigured()) {
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
    } else {
      // Mock mode - no Supabase configured
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } else {
      // Mock authentication - always succeed for demo
      const mockUser: AppUser = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'teacher'
      }
      addUser(mockUser)
      setUser(mockUser)
      
      // Redirect based on role
      if (window.location.pathname === '/login') {
        window.location.href = '/teacher'
      }
      
      return { error: null }
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: 'teacher' | 'student' }) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Signup error:', error)
        return { error }
      }

      // Create user profile in our users table using the database function
      if (data.user) {
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: email,
          user_name: userData.name,
          user_role: userData.role
        })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // If profile creation fails, we should clean up the auth user
          await supabase.auth.signOut()
          return { error: profileError }
        }
      }

      return { error: null }
    } else {
      // Mock authentication - create user in local storage
      const mockUser: AppUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: email,
        role: userData.role
      }
      addUser(mockUser)
      setUser(mockUser)
      
      // Redirect based on role
      if (window.location.pathname === '/login') {
        if (userData.role === 'teacher') {
          window.location.href = '/teacher'
        } else {
          window.location.href = '/student'
        }
      }
      
      return { error: null }
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    } else {
      // Mock sign out
      setUser(null)
      window.location.href = '/login'
    }
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
