import { supabase } from '../supabase'
import { TaskSubmission } from '../types'
import { checkAndUpdateTaskCompletion } from './tasks'

// Submission functions
export async function getSubmissionsByTask(taskId: string): Promise<TaskSubmission[]> {
  const { data, error } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('task_id', taskId)

  if (error) {
    console.error('Error fetching submissions:', error)
    return []
  }

  return data.map((submission: any) => ({
    id: submission.id,
    taskId: submission.task_id,
    studentId: submission.student_id,
    answers: submission.answers,
    status: submission.status,
    needsHelp: submission.needs_help,
    lastSaved: new Date(submission.last_saved),
    submittedAt: submission.submitted_at ? new Date(submission.submitted_at) : undefined,
    progress: submission.progress,
    hasUnreadHelp: submission.has_unread_help
  }))
}

export async function getSubmissionsByStudent(studentId: string): Promise<TaskSubmission[]> {
  const { data, error } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('student_id', studentId)

  if (error) {
    console.error('Error fetching student submissions:', error)
    return []
  }

  return data.map((submission: any) => ({
    id: submission.id,
    taskId: submission.task_id,
    studentId: submission.student_id,
    answers: submission.answers,
    status: submission.status,
    needsHelp: submission.needs_help,
    lastSaved: new Date(submission.last_saved),
    submittedAt: submission.submitted_at ? new Date(submission.submitted_at) : undefined,
    progress: submission.progress,
    hasUnreadHelp: submission.has_unread_help
  }))
}

export async function getSubmission(taskId: string, studentId: string): Promise<TaskSubmission | null> {
  const { data, error } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('student_id', studentId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No submission found, return null
      return null
    }
    console.error('Error fetching submission:', error)
    return null
  }

  return {
    id: data.id,
    taskId: data.task_id,
    studentId: data.student_id,
    answers: data.answers,
    status: data.status,
    needsHelp: data.needs_help,
    lastSaved: new Date(data.last_saved),
    submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
    progress: data.progress,
    hasUnreadHelp: data.has_unread_help
  }
}

export async function upsertSubmission(submission: Omit<TaskSubmission, 'id' | 'lastSaved'>): Promise<TaskSubmission | null> {
  const { data, error } = await supabase
    .from('task_submissions')
    .upsert({
      task_id: submission.taskId,
      student_id: submission.studentId,
      answers: submission.answers,
      status: submission.status,
      needs_help: submission.needsHelp,
      progress: submission.progress,
      submitted_at: submission.submittedAt?.toISOString(),
      last_saved: new Date().toISOString()
    }, {
      onConflict: 'task_id,student_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting submission:', error)
    console.error('Error details:', error.message, error.code, error.details)
    return null
  }

  const result = {
    id: data.id,
    taskId: data.task_id,
    studentId: data.student_id,
    answers: data.answers,
    status: data.status,
    needsHelp: data.needs_help,
    lastSaved: new Date(data.last_saved),
    submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
    progress: data.progress,
    hasUnreadHelp: data.has_unread_help
  }

  // If this submission was just completed, check if all students have completed the task
  if (submission.status === 'completed') {
    console.log(`Student completed submission for task ${submission.taskId}, checking task completion...`)
    await checkAndUpdateTaskCompletion(submission.taskId)
  }

  return result
}
