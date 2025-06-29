"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getGroupsByTeacher } from '@/lib/database/groups';
import { getTasksByGroup } from '@/lib/database/tasks';
import { Group, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar,
  FileText,
  ArrowLeft,
  Plus,
  BookOpen
} from 'lucide-react';
import { RefreshCw } from "lucide-react";
import { TaskOverviewDialog } from '@/components/task-overview-dialog';

interface GroupsDashboardProps {
  onNavigate: (tab: string) => void;
}

export function GroupsDashboard({ onNavigate }: GroupsDashboardProps) {
  const { user: currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskOverview, setShowTaskOverview] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);

  const loadGroups = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const teacherGroups = await getGroupsByTeacher(currentUser.id);
      setGroups(teacherGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupTasks = async (groupId: string) => {
    try {
      setLoadingTasks(true);
      const tasks = await getTasksByGroup(groupId);
      setGroupTasks(tasks);
    } catch (error) {
      console.error('Error loading group tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    loadGroupTasks(group.id);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setGroupTasks([]);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskOverview(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Indlæser grupper...
            </h1>
            <p className="text-gray-600 mt-1">Henter dine grupper</p>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show individual group view with tasks
  if (selectedGroup) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToGroups}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage til grupper
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedGroup.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedGroup.students.length} elever • {groupTasks.length} opgaver
              </p>
            </div>
          </div>
          <Button onClick={() => onNavigate('tasks')}>
            <Plus className="h-4 w-4 mr-2" />
            Opret opgave
          </Button>
        </div>

        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gruppe information</span>
            </CardTitle>
            {selectedGroup.description && (
              <CardDescription>{selectedGroup.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Oprettet {selectedGroup.createdAt.toLocaleDateString('da-DK')}</span>
              </div>
              <Badge variant="secondary">
                {selectedGroup.students.length} elever
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>Elever i gruppen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedGroup.students.map((student) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Opgaver i gruppen</span>
              {loadingTasks && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : groupTasks.length > 0 ? (
              <div className="space-y-4">
                {groupTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto hover:bg-blue-100"
                        onClick={() => handleTaskClick(task)}
                        title="Klik for at se opgave detaljer og elevernes fremgang"
                      >
                        <FileText className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                      </Button>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{task.subject}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/teacher/preview/${task.id}`, '_blank');
                        }}
                        title="Forhåndsvis opgave"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen opgaver i denne gruppe endnu</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onNavigate('tasks')}
                >
                  Opret første opgave
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Overview Dialog */}
        {selectedTask && (
          <TaskOverviewDialog
            task={selectedTask}
            groupStudents={selectedGroup.students}
            open={showTaskOverview}
            onOpenChange={setShowTaskOverview}
          />
        )}
      </div>
    );
  }

  // Show groups overview
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mine grupper
          </h1>
          <p className="text-gray-600 mt-1">
            Klik på en gruppe for at se opgaver og elever
          </p>
        </div>
        <Button onClick={() => onNavigate('groups')}>
          <Plus className="h-4 w-4 mr-2" />
          Opret gruppe
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ingen grupper endnu</h3>
            <p className="text-muted-foreground mb-4">
              Opret din første gruppe for at komme i gang med at organisere dine elever
            </p>
            <Button onClick={() => onNavigate('groups')}>
              <Plus className="h-4 w-4 mr-2" />
              Opret første gruppe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleGroupClick(group)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </div>
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

                {/* Students Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Elever</h4>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {group.students.slice(0, 3).map((student) => (
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
                    {group.students.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{group.students.length - 3} flere elever
                      </div>
                    )}
                    {group.students.length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        Ingen elever endnu
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    Klik for at se opgaver →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
