"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task, User } from '@/lib/types';
import { StudentTaskInterface } from './student-task-interface';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Clock, PlayCircle, Users, ArrowLeft } from 'lucide-react';

interface TaskOverviewDialogProps {
  task: Task;
  groupStudents: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskProgress {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
  completedStudents: User[];
  inProgressStudents: User[];
  notStartedStudents: User[];
}

type CategoryView = 'completed' | 'inProgress' | 'notStarted' | null;

export function TaskOverviewDialog({ task, groupStudents, open, onOpenChange }: TaskOverviewDialogProps) {
  const [progress, setProgress] = useState<TaskProgress>({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    total: 0,
    completedStudents: [],
    inProgressStudents: [],
    notStartedStudents: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryView>(null);

  useEffect(() => {
    if (open && task && groupStudents.length > 0) {
      loadTaskProgress();
    }
  }, [open, task, groupStudents]);

  const loadTaskProgress = async () => {
    try {
      setLoading(true);
      
      // Get all submissions for this task from students in the group
      const studentIds = groupStudents.map(student => student.id);
      
      const { data: submissions, error } = await supabase
        .from('task_submissions')
        .select('student_id, status, submitted_at')
        .eq('task_id', task.id)
        .in('student_id', studentIds);

      if (error) {
        console.error('Error loading task progress:', error);
        return;
      }

      // Calculate progress statistics
      const submissionMap = new Map();
      submissions?.forEach(submission => {
        submissionMap.set(submission.student_id, submission);
      });

      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;
      const completedStudents: User[] = [];
      const inProgressStudents: User[] = [];
      const notStartedStudents: User[] = [];

      groupStudents.forEach(student => {
        const submission = submissionMap.get(student.id);
        if (submission) {
          if (submission.status === 'submitted') {
            completed++;
            completedStudents.push(student);
          } else {
            inProgress++;
            inProgressStudents.push(student);
          }
        } else {
          notStarted++;
          notStartedStudents.push(student);
        }
      });

      setProgress({
        completed,
        inProgress,
        notStarted,
        total: groupStudents.length,
        completedStudents,
        inProgressStudents,
        notStartedStudents
      });
    } catch (error) {
      console.error('Error loading task progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const handleCategoryClick = (category: CategoryView) => {
    setSelectedCategory(category);
  };

  const handleBackToOverview = () => {
    setSelectedCategory(null);
  };

  const getCategoryTitle = (category: CategoryView) => {
    switch (category) {
      case 'completed':
        return 'Færdige elever';
      case 'inProgress':
        return 'Elever i gang';
      case 'notStarted':
        return 'Elever der ikke er startet';
      default:
        return '';
    }
  };

  const getCategoryStudents = (category: CategoryView) => {
    switch (category) {
      case 'completed':
        return progress.completedStudents;
      case 'inProgress':
        return progress.inProgressStudents;
      case 'notStarted':
        return progress.notStartedStudents;
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {task.title}
            </DialogTitle>
            <Badge variant="secondary">{task.subject}</Badge>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Task Progress Statistics */}
          <div className="w-80 border-r bg-muted/20 p-6 space-y-6">
            <div>
              {selectedCategory ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleBackToOverview}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Tilbage
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {getCategoryTitle(selectedCategory)}
                  </h3>
                  
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {getCategoryStudents(selectedCategory).map((student) => (
                        <Card key={student.id} className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {getCategoryStudents(selectedCategory).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Ingen elever i denne kategori</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Elevernes fremgang
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                  {/* Overall Progress */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Samlet fremgang</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Færdige</span>
                          <span>{progress.completed}/{progress.total}</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(completionPercentage)}% færdige
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Statistics */}
                  <div className="space-y-3">
                    <Card 
                      className="border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => handleCategoryClick('completed')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Færdige</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {progress.completed}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleCategoryClick('inProgress')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <PlayCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">I gang</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {progress.inProgress}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleCategoryClick('notStarted')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Ikke startet</span>
                          </div>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            {progress.notStarted}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Task Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Opgave information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Fag:</span>
                        <span className="ml-2">{task.subject}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Oprettet:</span>
                        <span className="ml-2">{task.createdAt.toLocaleDateString('da-DK')}</span>
                      </div>
                      {task.dueDate && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="ml-2">{task.dueDate.toLocaleDateString('da-DK')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side - Task Preview */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b bg-muted/10">
              <h3 className="font-semibold">Opgave forhåndsvisning</h3>
              <p className="text-sm text-muted-foreground">Sådan ser opgaven ud for eleverne</p>
            </div>
            <ScrollArea className="flex-1 p-6">
              <StudentTaskInterface 
                taskId={task.id} 
                studentId="preview" 
                previewMode={true}
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
