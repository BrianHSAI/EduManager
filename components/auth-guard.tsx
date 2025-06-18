'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'teacher' | 'student'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'teacher') {
          router.push('/teacher')
        } else {
          router.push('/student')
        }
        return
      }
    }
  }, [user, loading, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requiredRole && user.role !== requiredRole) {
    return null // Will redirect to appropriate dashboard
  }

  return <>{children}</>
}
