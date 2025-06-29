import { supabase } from '../supabase'
import { TaskFolder, TaskFolderAssignment } from '../types'

// Folder functions
export async function getFoldersByStudent(studentId: string): Promise<TaskFolder[]> {
  const { data, error } = await supabase
    .from('task_folders')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching folders:', error)
    return []
  }

  return data.map((folder: any) => ({
    id: folder.id,
    name: folder.name,
    studentId: folder.student_id,
    color: folder.color,
    createdAt: new Date(folder.created_at)
  }))
}

export async function createFolder(name: string, studentId: string, color?: string): Promise<TaskFolder | null> {
  const { data, error } = await supabase
    .from('task_folders')
    .insert({
      name,
      student_id: studentId,
      color,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    studentId: data.student_id,
    color: data.color,
    createdAt: new Date(data.created_at)
  }
}

export async function deleteFolder(folderId: string, studentId: string): Promise<boolean> {
  // First, remove all task assignments from this folder
  await supabase
    .from('task_folder_assignments')
    .delete()
    .eq('folder_id', folderId)
    .eq('student_id', studentId)

  // Then delete the folder
  const { error } = await supabase
    .from('task_folders')
    .delete()
    .eq('id', folderId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error deleting folder:', error)
    return false
  }

  return true
}

export async function updateFolder(folderId: string, studentId: string, updates: Partial<Pick<TaskFolder, 'name' | 'color'>>): Promise<TaskFolder | null> {
  const { data, error } = await supabase
    .from('task_folders')
    .update({
      name: updates.name,
      color: updates.color
    })
    .eq('id', folderId)
    .eq('student_id', studentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating folder:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    studentId: data.student_id,
    color: data.color,
    createdAt: new Date(data.created_at)
  }
}

// Task folder assignment functions
export async function getTaskFolderAssignments(studentId: string): Promise<TaskFolderAssignment[]> {
  const { data, error } = await supabase
    .from('task_folder_assignments')
    .select('*')
    .eq('student_id', studentId)

  if (error) {
    console.error('Error fetching task folder assignments:', error)
    return []
  }

  return data.map((assignment: any) => ({
    id: assignment.id,
    taskId: assignment.task_id,
    folderId: assignment.folder_id,
    studentId: assignment.student_id,
    createdAt: new Date(assignment.created_at)
  }))
}

export async function assignTaskToFolder(taskId: string, folderId: string, studentId: string): Promise<TaskFolderAssignment | null> {
  // First, remove any existing assignment for this task
  await supabase
    .from('task_folder_assignments')
    .delete()
    .eq('task_id', taskId)
    .eq('student_id', studentId)

  // Then create the new assignment
  const { data, error } = await supabase
    .from('task_folder_assignments')
    .insert({
      task_id: taskId,
      folder_id: folderId,
      student_id: studentId,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning task to folder:', error)
    return null
  }

  return {
    id: data.id,
    taskId: data.task_id,
    folderId: data.folder_id,
    studentId: data.student_id,
    createdAt: new Date(data.created_at)
  }
}

export async function removeTaskFromFolder(taskId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('task_folder_assignments')
    .delete()
    .eq('task_id', taskId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error removing task from folder:', error)
    return false
  }

  return true
}

export async function getTaskFolder(taskId: string, studentId: string): Promise<TaskFolder | null> {
  // First get the assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('task_folder_assignments')
    .select('folder_id')
    .eq('task_id', taskId)
    .eq('student_id', studentId)
    .single()

  if (assignmentError) {
    if (assignmentError.code === 'PGRST116') {
      // No assignment found
      return null
    }
    console.error('Error fetching task folder assignment:', assignmentError)
    return null
  }

  // Then get the folder details
  const { data: folder, error: folderError } = await supabase
    .from('task_folders')
    .select('*')
    .eq('id', assignment.folder_id)
    .single()

  if (folderError) {
    console.error('Error fetching folder details:', folderError)
    return null
  }

  return {
    id: folder.id,
    name: folder.name,
    studentId: folder.student_id,
    color: folder.color,
    createdAt: new Date(folder.created_at)
  }
}
