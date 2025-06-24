import { supabase } from '../supabase'
import { Group, GroupInvitation } from '../types'

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

  return groupsData.map((group: any) => ({
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

// Group invitation functions
export async function createGroupInvitation(groupId: string, studentEmail: string, invitedBy: string): Promise<GroupInvitation | null> {
  // First check if user exists and get their ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', studentEmail)
    .eq('role', 'student')
    .single()

  if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking user:', userError)
    return null
  }

  const { data: invitationData, error: invitationError } = await supabase
    .from('group_invitations')
    .insert([{
      group_id: groupId,
      student_email: studentEmail,
      student_id: userData?.id || null,
      invited_by: invitedBy,
      status: 'pending'
    }])
    .select()
    .single()

  if (invitationError) {
    console.error('Error creating invitation:', invitationError)
    return null
  }

  return {
    id: invitationData.id,
    groupId: invitationData.group_id,
    studentEmail: invitationData.student_email,
    studentId: invitationData.student_id,
    invitedBy: invitationData.invited_by,
    status: invitationData.status,
    invitedAt: new Date(invitationData.invited_at),
    respondedAt: invitationData.responded_at ? new Date(invitationData.responded_at) : undefined
  }
}

export async function getInvitationsByStudent(studentId: string): Promise<GroupInvitation[]> {
  // Get user email first
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('id', studentId)
    .single()

  if (userError) {
    console.error('Error fetching user:', userError)
    return []
  }

  const { data: invitationsData, error: invitationsError } = await supabase
    .from('group_invitations')
    .select(`
      *,
      groups (
        id,
        name,
        description,
        teacher_id,
        created_at
      ),
      users!group_invitations_invited_by_fkey (
        id,
        name,
        email,
        role,
        avatar
      )
    `)
    .or(`student_email.eq.${userData.email},student_id.eq.${studentId}`)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false })

  if (invitationsError) {
    console.error('Error fetching invitations:', invitationsError)
    return []
  }

  return invitationsData.map((invitation: any) => ({
    id: invitation.id,
    groupId: invitation.group_id,
    studentEmail: invitation.student_email,
    studentId: invitation.student_id,
    invitedBy: invitation.invited_by,
    status: invitation.status,
    invitedAt: new Date(invitation.invited_at),
    respondedAt: invitation.responded_at ? new Date(invitation.responded_at) : undefined,
    group: invitation.groups ? {
      id: invitation.groups.id,
      name: invitation.groups.name,
      description: invitation.groups.description,
      teacherId: invitation.groups.teacher_id,
      students: [], // We don't need to populate students for invitations
      createdAt: new Date(invitation.groups.created_at)
    } : undefined,
    invitedByUser: invitation.users ? {
      id: invitation.users.id,
      name: invitation.users.name,
      email: invitation.users.email,
      role: invitation.users.role,
      avatar: invitation.users.avatar
    } : undefined
  }))
}

export async function respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<boolean> {
  const { error: updateError } = await supabase
    .from('group_invitations')
    .update({
      status: response,
      responded_at: new Date().toISOString()
    })
    .eq('id', invitationId)

  if (updateError) {
    console.error('Error updating invitation:', updateError)
    return false
  }

  // If accepted, add student to group
  if (response === 'accepted') {
    // Get invitation details
    const { data: invitationData, error: invitationError } = await supabase
      .from('group_invitations')
      .select('group_id, student_id, student_email')
      .eq('id', invitationId)
      .single()

    if (invitationError) {
      console.error('Error fetching invitation details:', invitationError)
      return false
    }

    let studentId = invitationData.student_id

    // If no student_id, try to find the user by email
    if (!studentId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', invitationData.student_email)
        .eq('role', 'student')
        .single()

      if (userError) {
        console.error('Error finding student:', userError)
        return false
      }

      studentId = userData.id
    }

    // Add to group_members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: invitationData.group_id,
        student_id: studentId
      }])

    if (memberError) {
      console.error('Error adding group member:', memberError)
      return false
    }
  }

  return true
}

export async function updateGroup(groupId: string, updates: { name: string; description?: string }): Promise<boolean> {
  const { error } = await supabase
    .from('groups')
    .update({
      name: updates.name,
      description: updates.description
    })
    .eq('id', groupId)

  if (error) {
    console.error('Error updating group:', error)
    return false
  }

  return true
}

export async function removeStudentFromGroup(groupId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error removing student from group:', error)
    return false
  }

  return true
}

export async function getInvitationsByGroup(groupId: string): Promise<GroupInvitation[]> {
  const { data: invitationsData, error: invitationsError } = await supabase
    .from('group_invitations')
    .select(`
      *,
      users!group_invitations_invited_by_fkey (
        id,
        name,
        email,
        role,
        avatar
      )
    `)
    .eq('group_id', groupId)
    .order('invited_at', { ascending: false })

  if (invitationsError) {
    console.error('Error fetching group invitations:', invitationsError)
    return []
  }

  return invitationsData.map((invitation: any) => ({
    id: invitation.id,
    groupId: invitation.group_id,
    studentEmail: invitation.student_email,
    studentId: invitation.student_id,
    invitedBy: invitation.invited_by,
    status: invitation.status,
    invitedAt: new Date(invitation.invited_at),
    respondedAt: invitation.responded_at ? new Date(invitation.responded_at) : undefined,
    invitedByUser: invitation.users ? {
      id: invitation.users.id,
      name: invitation.users.name,
      email: invitation.users.email,
      role: invitation.users.role,
      avatar: invitation.users.avatar
    } : undefined
  }))
}

export async function deleteGroup(groupId: string): Promise<boolean> {
  console.log('Starting group deletion process for group:', groupId);
  
  try {
    // First delete related group_invitations
    console.log('Deleting group invitations...');
    const { error: invitationsError } = await supabase
      .from('group_invitations')
      .delete()
      .eq('group_id', groupId)

    if (invitationsError) {
      console.error('Error deleting group invitations:', invitationsError)
      throw new Error(`Failed to delete group invitations: ${invitationsError.message}`)
    }

    // Delete related group_members
    console.log('Deleting group members...');
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)

    if (membersError) {
      console.error('Error deleting group members:', membersError)
      throw new Error(`Failed to delete group members: ${membersError.message}`)
    }

    // Get related tasks first
    console.log('Fetching group tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('group_id', groupId)

    if (tasksError) {
      console.error('Error fetching group tasks for deletion:', tasksError)
      throw new Error(`Failed to fetch group tasks: ${tasksError.message}`)
    }

    console.log(`Found ${tasks?.length || 0} tasks to delete`);

    // Delete task dependencies for each task
    for (const task of tasks || []) {
      console.log('Deleting task assignments for task:', task.id);
      const { error: taskDeleteError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', task.id)

      if (taskDeleteError) {
        console.error('Error deleting task assignments for group deletion:', taskDeleteError)
        throw new Error(`Failed to delete task assignments for task ${task.id}: ${taskDeleteError.message}`)
      }

      console.log('Deleting task submissions for task:', task.id);
      const { error: submissionsDeleteError } = await supabase
        .from('task_submissions')
        .delete()
        .eq('task_id', task.id)

      if (submissionsDeleteError) {
        console.error('Error deleting task submissions for group deletion:', submissionsDeleteError)
        throw new Error(`Failed to delete task submissions for task ${task.id}: ${submissionsDeleteError.message}`)
      }
    }

    // Delete the tasks themselves
    console.log('Deleting group tasks...');
    const { error: deleteTasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('group_id', groupId)

    if (deleteTasksError) {
      console.error('Error deleting group tasks:', deleteTasksError)
      throw new Error(`Failed to delete group tasks: ${deleteTasksError.message}`)
    }

    // Finally delete the group
    console.log('Deleting the group itself...');
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (groupError) {
      console.error('Error deleting group:', groupError)
      throw new Error(`Failed to delete group: ${groupError.message}`)
    }

    console.log('Group deletion completed successfully');
    return true
  } catch (error) {
    console.error('Unexpected error during group deletion:', error);
    return false
  }
}
