import { supabase } from '../supabase'
import { Task, TaskField } from '../types'

// Task functions
export async function getTasksByTeacher(teacherId: string): Promise<Task[]> {
  console.log('Fetching tasks for teacher:', teacherId)
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments (
        student_id
      )
    `)
    .eq('teacher_id', teacherId)

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  console.log('Found tasks for teacher:', data?.length || 0)
  console.log('Tasks data:', data)

  return data.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    fields: task.fields as TaskField[],
    groupId: task.group_id,
    teacherId: task.teacher_id,
    assignedStudents: task.task_assignments.map((assignment: any) => assignment.student_id),
    assignmentType: task.assignment_type,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    createdAt: new Date(task.created_at),
    status: task.status || 'active'
  }))
}

export async function getTasksByStudent(studentId: string): Promise<Task[]> {
  console.log('Fetching tasks for student:', studentId)
  
  // First, get the groups the student belongs to
  const { data: studentGroups, error: groupsError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('student_id', studentId)

  if (groupsError) {
    console.error('Error fetching student groups:', groupsError)
    return []
  }

  console.log('Student belongs to groups:', studentGroups?.map(g => g.group_id))

  const groupIds = studentGroups?.map(g => g.group_id) || []

  // Get tasks assigned to groups the student belongs to
  let groupTasks: any[] = []
  if (groupIds.length > 0) {
    const { data, error: groupError } = await supabase
      .from('tasks')
      .select('*')
      .in('group_id', groupIds)
      .eq('assignment_type', 'class')

    if (groupError) {
      console.error('Error fetching group tasks:', groupError)
    } else {
      groupTasks = data || []
      console.log('Found group tasks:', groupTasks.length)
    }
  }

  // Get individually assigned tasks
  const { data: individualTasks, error: individualError } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments!inner (
        student_id
      )
    `)
    .eq('task_assignments.student_id', studentId)
    .eq('assignment_type', 'individual')

  if (individualError) {
    console.error('Error fetching individual tasks:', individualError)
  } else {
    console.log('Found individual tasks:', individualTasks?.length || 0)
  }

  const allTasks = [...groupTasks, ...(individualTasks || [])]
  console.log('Total tasks found for student:', allTasks.length)
  
  return allTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    fields: task.fields as TaskField[],
    groupId: task.group_id,
    teacherId: task.teacher_id,
    assignedStudents: [], // Not needed for student view
    assignmentType: task.assignment_type,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    createdAt: new Date(task.created_at),
    status: task.status || 'active'
  }))
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .insert([{
      title: task.title,
      description: task.description,
      subject: task.subject,
      fields: task.fields,
      group_id: task.groupId,
      teacher_id: task.teacherId,
      assignment_type: task.assignmentType,
      due_date: task.dueDate?.toISOString()
    }])
    .select()
    .single()

  if (taskError) {
    console.error('Error creating task:', taskError)
    return null
  }

  // Add individual assignments if needed
  if (task.assignmentType === 'individual' && task.assignedStudents.length > 0) {
    const { error: assignmentError } = await supabase
      .from('task_assignments')
      .insert(
        task.assignedStudents.map(studentId => ({
          task_id: taskData.id,
          student_id: studentId
        }))
      )

    if (assignmentError) {
      console.error('Error creating task assignments:', assignmentError)
    }
  }

  return {
    id: taskData.id,
    title: taskData.title,
    description: taskData.description,
    subject: taskData.subject,
    fields: taskData.fields as TaskField[],
    groupId: taskData.group_id,
    teacherId: taskData.teacher_id,
    assignedStudents: task.assignedStudents,
    assignmentType: taskData.assignment_type,
    dueDate: taskData.due_date ? new Date(taskData.due_date) : undefined,
    createdAt: new Date(taskData.created_at)
  }
}

export async function getTasksByGroup(groupId: string): Promise<Task[]> {
  console.log('Fetching tasks for group:', groupId)
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments (
        student_id
      )
    `)
    .eq('group_id', groupId)

  if (error) {
    console.error('Error fetching tasks for group:', error)
    return []
  }

  console.log('Found tasks for group:', data?.length || 0)

  return data.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    fields: task.fields as TaskField[],
    groupId: task.group_id,
    teacherId: task.teacher_id,
    assignedStudents: task.task_assignments.map((assignment: any) => assignment.student_id),
    assignmentType: task.assignment_type,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    createdAt: new Date(task.created_at),
    status: task.status || 'active'
  }))
}

export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments (
        student_id
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching task by id:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: data.subject,
    fields: data.fields as TaskField[],
    groupId: data.group_id,
    teacherId: data.teacher_id,
    assignedStudents: data.task_assignments.map((assignment: any) => assignment.student_id),
    assignmentType: data.assignment_type,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    createdAt: new Date(data.created_at),
    status: data.status || 'active'
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      subject: updates.subject,
      fields: updates.fields,
      due_date: updates.dueDate?.toISOString(),
      status: updates.status,
    })
    .eq('id', taskId)
    .select(`
      *,
      task_assignments (
        student_id
      )
    `)
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: data.subject,
    fields: data.fields as TaskField[],
    groupId: data.group_id,
    teacherId: data.teacher_id,
    assignedStudents: data.task_assignments.map((assignment: any) => assignment.student_id),
    assignmentType: data.assignment_type,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    createdAt: new Date(data.created_at),
    status: data.status
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  // First delete related task_assignments
  const { error: assignmentsError } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId)

  if (assignmentsError) {
    console.error('Error deleting task assignments:', assignmentsError)
    return false
  }

  // Then delete related task_submissions
  const { error: submissionsError } = await supabase
    .from('task_submissions')
    .delete()
    .eq('task_id', taskId)

  if (submissionsError) {
    console.error('Error deleting task submissions:', submissionsError)
    return false
  }

  // Finally delete the task
  const { error: taskError } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (taskError) {
    console.error('Error deleting task:', taskError)
    return false
  }

  return true
}

// Function to get all students assigned to a task
export async function getAssignedStudents(taskId: string): Promise<string[]> {
  const task = await getTaskById(taskId)
  if (!task) return []

  if (task.assignmentType === 'individual') {
    return task.assignedStudents
  } else if (task.assignmentType === 'class' && task.groupId) {
    // Get all students in the group
    const { data: groupMembers, error } = await supabase
      .from('group_members')
      .select('student_id')
      .eq('group_id', task.groupId)

    if (error) {
      console.error('Error fetching group members:', error)
      return []
    }

    return groupMembers.map(member => member.student_id)
  }

  return []
}

// Function to check if all students have completed a task and update status
export async function checkAndUpdateTaskCompletion(taskId: string): Promise<boolean> {
  try {
    // Get all students assigned to this task
    const assignedStudents = await getAssignedStudents(taskId)
    
    if (assignedStudents.length === 0) {
      console.log('No students assigned to task:', taskId)
      return false
    }

    // Get all submissions for this task
    const { data: submissions, error } = await supabase
      .from('task_submissions')
      .select('student_id, status')
      .eq('task_id', taskId)
      .eq('status', 'completed')

    if (error) {
      console.error('Error fetching submissions for task completion check:', error)
      return false
    }

    const completedStudentIds = submissions.map(sub => sub.student_id)
    
    // Check if all assigned students have completed submissions
    const allCompleted = assignedStudents.every(studentId => 
      completedStudentIds.includes(studentId)
    )

    console.log(`Task ${taskId}: ${completedStudentIds.length}/${assignedStudents.length} students completed`)

    if (allCompleted) {
      // Update task status to completed
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)

      if (updateError) {
        console.error('Error updating task status to completed:', updateError)
        return false
      }

      console.log(`Task ${taskId} marked as completed - all students finished`)
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking task completion:', error)
    return false
  }
}
