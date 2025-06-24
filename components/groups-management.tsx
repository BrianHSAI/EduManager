"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { getGroupsByTeacher, createGroupInvitation, createGroup, updateGroup, removeStudentFromGroup, deleteGroup } from '@/lib/database/groups';
import { useAuth } from '@/components/auth-provider';
import { Group, TaskField } from '@/lib/types';
import { TaskCreationDialog } from './task-creation-dialog';
import { GroupCreationDialog } from './group-creation-dialog';
import { GroupSettingsDialog } from './group-settings-dialog';
import { GroupsList } from './groups-list';
import { createTask } from '@/lib/database/tasks';

interface NewTaskData {
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  assignmentType: 'class' | 'individual';
}

export function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [selectedGroupForTask, setSelectedGroupForTask] = useState<Group | null>(null);
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<Group | null>(null);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);

  const loadGroups = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const groupsData = await getGroupsByTeacher(currentUser.id);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (name: string, description?: string) => {
    if (!currentUser) return;
    
    const newGroup = await createGroup({
      name,
      description,
      teacherId: currentUser.id
    }, []);
    
    if (newGroup) {
      await loadGroups();
    }
  };

  const handleUpdateGroup = async (groupId: string, updates: { name: string; description?: string }) => {
    try {
      const success = await updateGroup(groupId, updates);
      if (success) {
        console.log('Group updated successfully');
        await loadGroups();
      } else {
        console.error('Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleInviteStudent = async (groupId: string, email: string) => {
    if (!currentUser) return;
    
    const invitation = await createGroupInvitation(groupId, email, currentUser.id);
    
    if (invitation) {
      console.log('Invitation sent successfully');
      await loadGroups();
    }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    try {
      const success = await removeStudentFromGroup(groupId, studentId);
      if (success) {
        console.log('Student removed successfully');
        await loadGroups();
      } else {
        console.error('Failed to remove student from group');
      }
    } catch (error) {
      console.error('Error removing student from group:', error);
    }
  };

  const handleCreateTask = async (taskData: NewTaskData, fields: TaskField[], selectedStudents: string[]) => {
    if (!currentUser || !selectedGroupForTask) return;
    
    try {
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject as 'matematik' | 'dansk' | 'engelsk' | 'historie' | 'andet',
        fields: fields,
        groupId: selectedGroupForTask.id,
        teacherId: currentUser.id,
        assignedStudents: [],
        assignmentType: 'class' as const,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
      };

      const createdTask = await createTask(newTask);
      
      if (createdTask) {
        console.log('Task created successfully for group:', selectedGroupForTask.name, createdTask);
        setShowCreateTask(false);
        setSelectedGroupForTask(null);
        // Refresh the groups to update task counts
        await loadGroups();
      }
    } catch (error) {
      console.error('Error creating task for group:', error);
    }
  };

  const handleCreateTaskForGroup = (group: Group) => {
    setSelectedGroupForTask(group);
    setShowCreateTask(true);
  };

  const handleGroupSettings = (group: Group) => {
    setSelectedGroupForSettings(group);
    setShowGroupSettings(true);
  };

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Er du sikker på, at du vil slette gruppen "${group.name}"? Dette vil også slette alle opgaver tilknyttet gruppen og kan ikke fortrydes.`)) {
      return;
    }

    try {
      console.log('Attempting to delete group:', group.id, group.name);
      const success = await deleteGroup(group.id);
      if (success) {
        console.log('Group deleted successfully');
        alert('Gruppen blev slettet succesfuldt!');
        await loadGroups(); // Reload groups
      } else {
        console.error('Failed to delete group');
        alert('Kunne ikke slette gruppen. Tjek konsollen for detaljer og prøv igen senere.');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl';
      alert(`Der opstod en fejl ved sletning af gruppen: ${errorMessage}`);
    }
  };

  // If no current user, show loading or error state
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ingen bruger fundet</h1>
            <p className="text-muted-foreground">
              Du skal være logget ind for at se dine grupper.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Indlæser grupper...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupper</h1>
          <p className="text-muted-foreground mt-2">
            Administrer dine klasser og elever
          </p>
        </div>
        <Button onClick={() => setShowCreateGroup(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Opret Gruppe
        </Button>
      </div>

      <GroupsList
        groups={groups}
        onSettings={handleGroupSettings}
        onCreateTask={handleCreateTaskForGroup}
        onDelete={handleDeleteGroup}
        onInviteStudent={handleInviteStudent}
        onCreateGroup={() => setShowCreateGroup(true)}
        onRefresh={loadGroups}
      />

      {/* Group Creation Dialog */}
      <GroupCreationDialog
        isOpen={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onCreateGroup={handleCreateGroup}
      />

      {/* Group Settings Dialog */}
      <GroupSettingsDialog
        isOpen={showGroupSettings}
        onOpenChange={setShowGroupSettings}
        group={selectedGroupForSettings}
        onUpdateGroup={handleUpdateGroup}
        onInviteStudent={handleInviteStudent}
        onRemoveStudent={handleRemoveStudent}
      />

      {/* Task Creation Dialog */}
      {selectedGroupForTask && showCreateTask && (
        <TaskCreationDialog
          groups={[selectedGroupForTask]}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
}
