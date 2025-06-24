"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar,
  Settings,
  Trash2,
  UserPlus,
  FileText,
  BookOpen
} from 'lucide-react';
import { Group, User, Task } from '@/lib/types';
import { StudentInvitationDialog } from './student-invitation-dialog';
import { useState, useEffect } from 'react';
import { getTasksByGroup } from '@/lib/database/tasks';

interface GroupCardProps {
  group: Group;
  onSettings: (group: Group) => void;
  onCreateTask: (group: Group) => void;
  onDelete: (group: Group) => void;
  onInviteStudent: (groupId: string, email: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function GroupCard({
  group,
  onSettings,
  onCreateTask,
  onDelete,
  onInviteStudent,
  onRefresh
}: GroupCardProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [group.id]);

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const groupTasks = await getTasksByGroup(group.id);
      setTasks(groupTasks);
    } catch (error) {
      console.error('Error loading tasks for group:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleInviteStudent = async (email: string) => {
    await onInviteStudent(group.id, email);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{group.name}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSettings(group)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          {group.description && (
            <CardDescription>{group.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Oprettet {group.createdAt.toLocaleDateString('da-DK')}
              </span>
            </div>
            <Badge variant="secondary">
              {group.students.length} elever
            </Badge>
          </div>

          {/* Students List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Elever</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {group.students.slice(0, 4).map((student: User) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="text-xs">
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">{student.name}</span>
                </div>
              ))}
              {group.students.length > 4 && (
                <div className="text-xs text-muted-foreground">
                  +{group.students.length - 4} flere elever
                </div>
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Opgaver</h4>
              <Badge variant="outline">
                {isLoadingTasks ? '...' : tasks.length}
              </Badge>
            </div>
            
            {isLoadingTasks ? (
              <div className="text-xs text-muted-foreground">Indlæser opgaver...</div>
            ) : tasks.length > 0 ? (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {tasks.slice(0, 3).map((task: Task) => (
                  <div key={task.id} className="flex items-center space-x-2 p-1 rounded bg-muted/50">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs truncate">{task.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {task.subject}
                    </Badge>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{tasks.length - 3} flere opgaver
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Ingen opgaver endnu</div>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCreateTask(group)}
            >
              Opret opgave til gruppe
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(group)}
              title="Slet gruppe"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Invitation Dialog */}
      <StudentInvitationDialog
        isOpen={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        groupName={group.name}
        onInviteStudent={handleInviteStudent}
      />
    </>
  );
}
