import { supabase, isSupabaseConfigured } from '../supabase'
import { User } from '../types'
import { getCurrentUser as getMockCurrentUser } from '../mock-data'

// User functions
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    // Use mock data when Supabase is not configured
    console.log('Using mock data - Supabase not configured')
    return getMockCurrentUser()
  }

  console.log('Getting current user from Supabase...')
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Auth user:', user?.id, user?.email)
  
  if (!user) {
    console.log('No auth user found')
    return null
  }

  console.log('Fetching user profile for ID:', user.id)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    
    // If user profile doesn't exist (PGRST116 error), create one
    if (error.code === 'PGRST116') {
      console.log('User profile not found, creating one...')
      
      // Extract name from email (fallback)
      const emailName = user.email?.split('@')[0] || 'User'
      const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
      
      // Create user profile with default role as student
      const { error: createError } = await supabase.rpc('create_user_profile', {
        user_id: user.id,
        user_email: user.email,
        user_name: displayName,
        user_role: 'student'
      })
      
      if (createError) {
        console.error('Error creating user profile:', createError)
        return null
      }
      
      console.log('User profile created successfully')
      // Fetch the newly created profile
      const { data: newData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (fetchError) {
        console.error('Error fetching newly created profile:', fetchError)
        return null
      }
      
      return {
        id: newData.id,
        name: newData.name,
        email: newData.email,
        role: newData.role,
        avatar: newData.avatar
      }
    }
    
    return null
  }

  console.log('User profile found:', data)
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar
  }
}

export async function createUser(user: Omit<User, 'id'>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user by id:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar
  }
}

export async function getAllStudentsByTeacher(teacherId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      group_members!inner (
        groups!inner (
          teacher_id
        )
      )
    `)
    .eq('role', 'student')
    .eq('group_members.groups.teacher_id', teacherId)

  if (error) {
    console.error('Error fetching students by teacher:', error)
    return []
  }

  // Remove duplicates
  const uniqueStudents = data.reduce((acc: User[], student: any) => {
    if (!acc.find(s => s.id === student.id)) {
      acc.push({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        avatar: student.avatar
      })
    }
    return acc
  }, [])

  return uniqueStudents
}
