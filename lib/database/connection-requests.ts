import { supabase } from '../supabase'
import { ConnectionRequest } from '../types'

// Connection request functions
export async function createConnectionRequest(
  studentId: string,
  teacherId: string,
  studentName: string,
  studentClass: string,
  message?: string
): Promise<ConnectionRequest | null> {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert([{
      student_id: studentId,
      teacher_id: teacherId,
      student_name: studentName,
      student_class: studentClass,
      message: message,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating connection request:', error)
    return null
  }

  return {
    id: data.id,
    studentId: data.student_id,
    teacherId: data.teacher_id,
    studentName: data.student_name,
    studentClass: data.student_class,
    message: data.message,
    status: data.status,
    createdAt: new Date(data.created_at),
    respondedAt: data.responded_at ? new Date(data.responded_at) : undefined
  }
}

export async function getConnectionRequestsByTeacher(teacherId: string): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select(`
      *,
      users!connection_requests_student_id_fkey (
        id,
        name,
        email,
        role,
        avatar
      )
    `)
    .eq('teacher_id', teacherId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching connection requests:', error)
    return []
  }

  return data.map((request: any) => ({
    id: request.id,
    studentId: request.student_id,
    teacherId: request.teacher_id,
    studentName: request.student_name,
    studentClass: request.student_class,
    message: request.message,
    status: request.status,
    createdAt: new Date(request.created_at),
    respondedAt: request.responded_at ? new Date(request.responded_at) : undefined,
    student: request.users ? {
      id: request.users.id,
      name: request.users.name,
      email: request.users.email,
      role: request.users.role,
      avatar: request.users.avatar
    } : undefined
  }))
}

export async function getConnectionRequestsByStudent(studentId: string): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase
    .from('connection_requests')
    .select(`
      *,
      users!connection_requests_teacher_id_fkey (
        id,
        name,
        email,
        role,
        avatar
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student connection requests:', error)
    return []
  }

  return data.map((request: any) => ({
    id: request.id,
    studentId: request.student_id,
    teacherId: request.teacher_id,
    studentName: request.student_name,
    studentClass: request.student_class,
    message: request.message,
    status: request.status,
    createdAt: new Date(request.created_at),
    respondedAt: request.responded_at ? new Date(request.responded_at) : undefined,
    teacher: request.users ? {
      id: request.users.id,
      name: request.users.name,
      email: request.users.email,
      role: request.users.role,
      avatar: request.users.avatar
    } : undefined
  }))
}

export async function respondToConnectionRequest(
  requestId: string,
  response: 'accepted' | 'declined'
): Promise<boolean> {
  const { error } = await supabase
    .from('connection_requests')
    .update({
      status: response,
      responded_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (error) {
    console.error('Error responding to connection request:', error)
    return false
  }

  return true
}

export async function getAllTeachers(): Promise<{ id: string; name: string; email: string }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'teacher')
    .order('name')

  if (error) {
    console.error('Error fetching teachers:', error)
    return []
  }

  return data
}

export async function deleteConnectionRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('connection_requests')
    .delete()
    .eq('id', requestId)

  if (error) {
    console.error('Error deleting connection request:', error)
    return false
  }

  return true
}
