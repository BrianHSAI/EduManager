"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { 
  getCurrentUser, 
  getGroupsByTeacher, 
  mockTasks,
  getSubmissionsByTask
} from '@/lib/mock-data';
import { TaskField } from '@/lib/types';
import { TaskCreationDialog } from './task-creation-dialog';
import { TaskListItem } from './task-list-item';

interface NewTaskData {
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  assignmentType: 'class' | 'individual';
}

export function TaskManagement() {
  const currentUser = getCurrentUser();
  const groups = getGroupsByTeacher(currentUser.id);

  const handleCreateTask = (taskData: NewTaskData, fields: TaskField[], selectedStudents: string[]) => {
    console.log('Creating task:', { ...taskData, fields, selectedStudents });
    // In a real app, this would make an API call to create the task
  };

  const getTaskStats = (taskId: string) => {
    const submissions = getSubmissionsByTask(taskId);
    const completed = submissions.filter(s => s.status === 'completed').length;
    const inProgress = submissions.filter(s => s.status === 'in-progress').length;
    const needsHelp = submissions.filter(s => s.needsHelp).length;
    const notStarted = submissions.filter(s => s.status === 'not-started').length;
    
    return { completed, inProgress, needsHelp, notStarted, total: submissions.length };
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

      {/* Tasks List */}
      <div className="space-y-4">
        {mockTasks.map((task) => {
          const stats = getTaskStats(task.id);
          const group = groups.find(g => g.id === task.groupId);

          return (
            <TaskListItem
              key={task.id}
              task={task}
              group={group}
              stats={stats}
            />
          );
        })}

        {mockTasks.length === 0 && (
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
      </div>
    </div>
  );
}
