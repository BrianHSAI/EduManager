import { supabase } from '../supabase'
import { HelpMessage } from '../types'

export async function createHelpMessage(helpMessage: Omit<HelpMessage, 'id' | 'createdAt'>): Promise<HelpMessage | null> {
  const { data, error } = await supabase
    .from('help_messages')
    .insert({
      submission_id: helpMessage.submissionId,
      student_id: helpMessage.studentId,
      teacher_id: helpMessage.teacherId,
      message: helpMessage.message,
      urgency: helpMessage.urgency,
      category: helpMessage.category,
      is_from_student: helpMessage.isFromStudent,
      read_at: helpMessage.readAt?.toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating help message:', error)
    return null
  }

  return {
    id: data.id,
    submissionId: data.submission_id,
    studentId: data.student_id,
    teacherId: data.teacher_id,
    message: data.message,
    urgency: data.urgency,
    category: data.category,
    isFromStudent: data.is_from_student,
    createdAt: new Date(data.created_at),
    readAt: data.read_at ? new Date(data.read_at) : undefined
  }
}

export async function getHelpMessagesBySubmission(submissionId: string): Promise<HelpMessage[]> {
  const { data, error } = await supabase
    .from('help_messages')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching help messages:', error)
    return []
  }

  return data.map((msg: any) => ({
    id: msg.id,
    submissionId: msg.submission_id,
    studentId: msg.student_id,
    teacherId: msg.teacher_id,
    message: msg.message,
    urgency: msg.urgency,
    category: msg.category,
    isFromStudent: msg.is_from_student,
    createdAt: new Date(msg.created_at),
    readAt: msg.read_at ? new Date(msg.read_at) : undefined
  }))
}

export async function markHelpMessagesAsRead(submissionId: string, isStudent: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('help_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('submission_id', submissionId)
    .eq('is_from_student', !isStudent) // Mark messages from the other party as read

  if (error) {
    console.error('Error marking help messages as read:', error)
    return false
  }

  return true
}

export async function removeHelpRequest(submissionId: string): Promise<boolean> {
  // Update the submission to remove the help request flag
  const { error: submissionError } = await supabase
    .from('task_submissions')
    .update({ 
      needs_help: false,
      has_unread_help: false 
    })
    .eq('id', submissionId)

  if (submissionError) {
    console.error('Error removing help request from submission:', submissionError)
    return false
  }

  return true
}

export async function hasTeacherResponded(submissionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('help_messages')
    .select('id')
    .eq('submission_id', submissionId)
    .eq('is_from_student', false)
    .limit(1)

  if (error) {
    console.error('Error checking teacher response:', error)
    return false
  }

  return data && data.length > 0
}
