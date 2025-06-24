"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { getSubmissionsByTask } from '@/lib/database/submissions';
import { getGroupsByTeacher } from '@/lib/database/groups';
import { getTasksByTeacher, createTask, deleteTask, updateTask } from '@/lib/database/tasks';
import { TaskField, Group, Task } from '@/lib/types';
import { TaskCreationDialog } from './task-creation-dialog';
import { TaskListItem } from './task-list-item';
import { TaskEditDialog } from './task-edit-dialog';
import { TaskSubmissionsView } from './task-submissions-view';
import { SubmissionPreviewDialog } from './submission-preview-dialog';
import { TaskFilters } from './task-filters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { TaskSubmission, User } from '@/lib/types';
import { getUserById } from '@/lib/database/users';

interface NewTaskData {
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  assignmentType: 'class' | 'individual';
}

export function TaskManagement() {
  const { user: currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<Task | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<{
    task: Task;
    submission: TaskSubmission;
    student: User;
  } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Filter tasks based on selected filters
  useEffect(() => {
    let filtered = [...tasks];

    if (selectedGroupId) {
      filtered = filtered.filter(task => task.groupId === selectedGroupId);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => (task.status || 'active') === selectedStatus);
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedGroupId, selectedStatus]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const [groupsData, tasksData] = await Promise.all([
        getGroupsByTeacher(currentUser.id),
        getTasksByTeacher(currentUser.id)
      ]);
      setGroups(groupsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If no current user, show error state
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ingen bruger fundet</h1>
            <p className="text-muted-foreground">
              Du skal være logget ind for at se dine opgaver.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateTask = async (taskData: NewTaskData, fields: TaskField[], selectedStudents: string[]) => {
    if (!currentUser) return;
    
    try {
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject as 'matematik' | 'dansk' | 'engelsk' | 'historie' | 'andet',
        fields: fields,
        groupId: taskData.assignmentType === 'class' ? taskData.groupId : undefined,
        teacherId: currentUser.id,
        assignedStudents: taskData.assignmentType === 'individual' ? selectedStudents : [],
        assignmentType: taskData.assignmentType,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
      };

      const createdTask = await createTask(newTask);
      
      if (createdTask) {
        // Reload tasks to show the new one
        await loadData();
        console.log('Task created successfully:', createdTask);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        console.log('Task deleted successfully');
        await loadData(); // Reload tasks
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      if (updatedTask) {
        console.log('Task updated successfully:', updatedTask);
        await loadData(); // Reload tasks to show updates
        setEditingTask(null);
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleViewSubmissions = (task: Task) => {
    setViewingSubmissions(task);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opgaver</h1>
          <p className="text-muted-foreground mt-2">
            Opret og administrer opgaver til dine elever
          </p>
        </div>
        <TaskCreationDialog groups={groups} onCreateTask={handleCreateTask} />
      </div>

      {/* Task Filters */}
      {tasks.length > 0 && (
        <TaskFilters
          groups={groups}
          selectedGroupId={selectedGroupId}
          selectedStatus={selectedStatus}
          onGroupChange={setSelectedGroupId}
          onStatusChange={setSelectedStatus}
          onClearFilters={() => {
            setSelectedGroupId(undefined);
            setSelectedStatus('all');
          }}
        />
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Indlæser opgaver...</span>
          </div>
        ) : (
          <>
            {filteredTasks.map((task: Task) => {
              const group = groups.find(g => g.id === task.groupId);

              return (
                <TaskListItem
                  key={task.id}
                  task={task}
                  group={group}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onViewSubmissions={handleViewSubmissions}
                />
              );
            })}

            {tasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ingen opgaver endnu</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Opret din første opgave for at begynde at give dine elever arbejde
                  </p>
                  <TaskCreationDialog groups={groups} onCreateTask={handleCreateTask} />
                </CardContent>
              </Card>
            )}

            {tasks.length > 0 && filteredTasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ingen opgaver matcher filtrene</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Prøv at justere dine filtre for at se flere opgaver
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rediger opgave</DialogTitle>
            </DialogHeader>
            <TaskEditDialog
              task={editingTask}
              onUpdateTask={async (taskId, updates) => {
                await handleUpdateTask(taskId, updates);
                setEditingTask(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Submissions Dialog */}
      {viewingSubmissions && (
        <Dialog open={!!viewingSubmissions} onOpenChange={() => setViewingSubmissions(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Besvarelser for "{viewingSubmissions.title}"</DialogTitle>
            </DialogHeader>
            <TaskSubmissionsView
              task={viewingSubmissions}
              onViewSubmission={async (submission, student) => {
                setPreviewSubmission({
                  task: viewingSubmissions,
                  submission,
                  student
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Submission Preview Dialog */}
      {previewSubmission && (
        <SubmissionPreviewDialog
          task={previewSubmission.task}
          submission={previewSubmission.submission}
          student={previewSubmission.student}
          open={!!previewSubmission}
          onOpenChange={() => setPreviewSubmission(null)}
        />
      )}
    </div>
  );
}
