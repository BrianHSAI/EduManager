import { supabase } from './supabase'
import { User, Group, Task, TaskSubmission, TaskField } from './types'

// User functions
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
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

// Group functions
export async function getGroupsByTeacher(teacherId: string): Promise<Group[]> {
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select(`
      *,
      group_members (
        student_id,
        users!group_members_student_id_fkey (
          id,
          name,
          email,
          role,
          avatar
        )
      )
    `)
    .eq('teacher_id', teacherId)

  if (groupsError) {
    console.error('Error fetching groups:', groupsError)
    return []
  }

  return groupsData.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    teacherId: group.teacher_id,
    students: group.group_members.map((member: any) => ({
      id: member.users.id,
      name: member.users.name,
      email: member.users.email,
      role: member.users.role,
      avatar: member.users.avatar
    })),
    createdAt: new Date(group.created_at)
  }))
}

export async function createGroup(group: Omit<Group, 'id' | 'students' | 'createdAt'>, studentIds: string[]): Promise<Group | null> {
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert([{
      name: group.name,
      description: group.description,
      teacher_id: group.teacherId
    }])
    .select()
    .single()

  if (groupError) {
    console.error('Error creating group:', groupError)
    return null
  }

  // Add students to group
  if (studentIds.length > 0) {
    const { error: membersError } = await supabase
      .from('group_members')
      .insert(
        studentIds.map(studentId => ({
          group_id: groupData.id,
          student_id: studentId
        }))
      )

    if (membersError) {
      console.error('Error adding group members:', membersError)
    }
  }

  // Fetch the complete group with students
  const groups = await getGroupsByTeacher(group.teacherId)
  return groups.find(g => g.id === groupData.id) || null
}

// Task functions
export async function getTasksByTeacher(teacherId: string): Promise<Task[]> {
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

  return data.map(task => ({
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
    createdAt: new Date(task.created_at)
  }))
}

export async function getTasksByStudent(studentId: string): Promise<Task[]> {
  // Get tasks assigned to groups the student belongs to
  const { data: groupTasks, error: groupError } = await supabase
    .from('tasks')
    .select(`
      *,
      groups!inner (
        group_members!inner (
          student_id
        )
      )
    `)
    .eq('groups.group_members.student_id', studentId)
    .not('group_id', 'is', null)

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

  if (groupError || individualError) {
    console.error('Error fetching student tasks:', groupError || individualError)
    return []
  }

  const allTasks = [...(groupTasks || []), ...(individualTasks || [])]
  
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
    createdAt: new Date(task.created_at)
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

  return data.map(submission => ({
    id: submission.id,
    taskId: submission.task_id,
    studentId: submission.student_id,
    answers: submission.answers,
    status: submission.status,
    needsHelp: submission.needs_help,
    lastSaved: new Date(submission.last_saved),
    submittedAt: submission.submitted_at ? new Date(submission.submitted_at) : undefined,
    progress: submission.progress
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

  return data.map(submission => ({
    id: submission.id,
    taskId: submission.task_id,
    studentId: submission.student_id,
    answers: submission.answers,
    status: submission.status,
    needsHelp: submission.needs_help,
    lastSaved: new Date(submission.last_saved),
    submittedAt: submission.submitted_at ? new Date(submission.submitted_at) : undefined,
    progress: submission.progress
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
    progress: data.progress
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
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting submission:', error)
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
    progress: data.progress
  }
}

// Helper functions
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
    createdAt: new Date(data.created_at)
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
