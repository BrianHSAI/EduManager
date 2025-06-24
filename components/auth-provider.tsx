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
      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log('Auth state change:', event, session?.user?.email)
        setSupabaseUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile directly using the session user ID
          console.log('Fetching user profile for session user:', session.user.id)
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching user profile in auth change:', error)
            console.error('Error details:', error.message, error.code, error.details)
            
            // If user profile doesn't exist (PGRST116 error), create one
            if (error.code === 'PGRST116') {
              console.log('User profile not found, creating one...')
              
              // Extract name from email (fallback)
              const emailName = session.user.email?.split('@')[0] || 'User'
              const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
              
              // Create user profile with default role as student
              const { error: createError } = await supabase.rpc('create_user_profile', {
                user_id: session.user.id,
                user_email: session.user.email,
                user_name: displayName,
                user_role: 'student'
              })
              
              if (createError) {
                console.error('Error creating user profile:', createError)
                setUser(null)
              } else {
                console.log('User profile created successfully')
                // Fetch the newly created profile
                const { data: newData, error: fetchError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()
                
                if (fetchError) {
                  console.error('Error fetching newly created profile:', fetchError)
                  setUser(null)
                } else {
                  const appUser = {
                    id: newData.id,
                    name: newData.name,
                    email: newData.email,
                    role: newData.role,
                    avatar: newData.avatar
                  }
                  setUser(appUser)
                  
                  // Redirect based on user role after successful auth
                  if (window.location.pathname === '/login') {
                    console.log('Redirecting user based on role:', appUser.role)
                    if (appUser.role === 'teacher') {
                      window.location.href = '/teacher'
                    } else {
                      window.location.href = '/student'
                    }
                  }
                }
              }
            } else {
              setUser(null)
            }
          } else {
            console.log('User profile found in auth change:', data)
            const appUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              avatar: data.avatar
            }
            setUser(appUser)
            
            // Redirect based on user role after successful auth
            if (window.location.pathname === '/login') {
              console.log('Redirecting user based on role:', appUser.role)
              if (appUser.role === 'teacher') {
                window.location.href = '/teacher'
              } else {
                window.location.href = '/student'
              }
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
      // Check for existing user in localStorage
      getCurrentUser().then(setUser)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      console.log('Attempting Supabase sign in for:', email)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('Sign in result:', { data, error })
        
        if (error) {
          console.error('Sign in error:', error.message)
        } else if (data.user) {
          console.log('Sign in successful, user:', data.user.email)
        }
        
        return { error }
      } catch (err) {
        console.error('Sign in catch error:', err)
        return { error: err }
      }
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
      console.log('Attempting Supabase sign up for:', email, userData)
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { error: { message: 'Please enter a valid email address' } }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Signup result:', { data, error })

      if (error) {
        console.error('Signup error:', error)
        // Provide more user-friendly error messages
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          return { error: { message: 'Please enter a valid email address' } }
        }
        if (error.message.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } }
        }
        return { error }
      }

      // Create user profile in our users table using the database function
      if (data.user) {
        console.log('Creating user profile for:', data.user.id)
        
        // Check if user profile already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (existingUser) {
          console.log('User profile already exists')
          return { error: null }
        }

        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: email,
          user_name: userData.name,
          user_role: userData.role
        })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          
          // Check if it's a unique constraint violation (user already exists)
          if (profileError.message && profileError.message.includes('duplicate key')) {
            console.log('User profile already exists, continuing...')
            return { error: null }
          }
          
          // If profile creation fails for other reasons, clean up the auth user
          await supabase.auth.signOut()
          return { error: { message: 'Failed to create user profile. Please try again.' } }
        }
        console.log('User profile created successfully')
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
      // Mock sign out - clear localStorage
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
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
