"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Search,
  Filter,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Task, TaskSubmission } from '@/lib/types';
import { getTasksByStudent, getSubmissionsByStudent } from '@/lib/database';
import { LogoutButton } from '@/components/logout-button';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/components/auth-provider';

function StudentDashboardContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [studentTasks, studentSubmissions] = await Promise.all([
        getTasksByStudent(user.id),
        getSubmissionsByStudent(user.id)
      ]);
      
      setTasks(studentTasks);
      setSubmissions(studentSubmissions);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Indlæser...</p>
        </div>
      </div>
    );
  }

  // Create a map of submissions by task ID for easy lookup
  const submissionMap = new Map(
    submissions.map(sub => [sub.taskId, sub])
  );

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const submission = submissionMap.get(task.id);
    const status = submission?.status || 'not-started';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    const matchesSubject = subjectFilter === 'all' || task.subject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Calculate overall statistics
  const totalTasks = tasks.length;
  const completedTasks = submissions.filter(sub => sub.status === 'completed').length;
  const inProgressTasks = submissions.filter(sub => sub.status === 'in-progress').length;
  const needsHelpTasks = submissions.filter(sub => sub.needsHelp).length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getTaskStatus = (task: Task) => {
    const submission = submissionMap.get(task.id);
    return submission?.status || 'not-started';
  };

  const getTaskProgress = (task: Task) => {
    const submission = submissionMap.get(task.id);
    return submission?.progress || 0;
  };

  const getStatusBadge = (status: string, needsHelp: boolean = false) => {
    if (needsHelp) {
      return (
        <Badge variant="destructive">
          <HelpCircle className="h-3 w-3 mr-1" />
          Hjælp anmodet
        </Badge>
      );
    }

    switch (status) {
      case 'completed':
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Færdig
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            I gang
          </Badge>
        );
      case 'not-started':
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            Ikke startet
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      matematik: 'bg-blue-100 text-blue-800',
      dansk: 'bg-green-100 text-green-800',
      engelsk: 'bg-purple-100 text-purple-800',
      historie: 'bg-orange-100 text-orange-800',
      andet: 'bg-gray-100 text-gray-800'
    };
    return colors[subject as keyof typeof colors] || colors.andet;
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mine Opgaver</h1>
            <p className="text-muted-foreground mt-1">
              Velkommen tilbage, {user?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Samlede Opgaver</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Færdige</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">I Gang</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hjælp Anmodet</CardTitle>
              <HelpCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{needsHelpTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Samlet Fremskridt</CardTitle>
            <CardDescription>
              Du har færdiggjort {completedTasks} ud af {totalTasks} opgaver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fremskridt</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtrer Opgaver</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søg opgaver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer efter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle status</SelectItem>
                  <SelectItem value="not-started">Ikke startet</SelectItem>
                  <SelectItem value="in-progress">I gang</SelectItem>
                  <SelectItem value="completed">Færdig</SelectItem>
                  <SelectItem value="needs-help">Hjælp anmodet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer efter fag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle fag</SelectItem>
                  <SelectItem value="matematik">Matematik</SelectItem>
                  <SelectItem value="dansk">Dansk</SelectItem>
                  <SelectItem value="engelsk">Engelsk</SelectItem>
                  <SelectItem value="historie">Historie</SelectItem>
                  <SelectItem value="andet">Andet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Opgaver ({filteredTasks.length})
          </h2>
          
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ingen opgaver fundet</h3>
                  <p className="text-muted-foreground">
                    Prøv at justere dine filtre eller søgekriterier.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTasks.map((task) => {
                const status = getTaskStatus(task);
                const progress = getTaskProgress(task);
                const submission = submissionMap.get(task.id);
                const needsHelp = submission?.needsHelp || false;
                const overdue = isOverdue(task.dueDate);

                return (
                  <Card key={task.id} className={`transition-all hover:shadow-md ${overdue && status !== 'completed' ? 'border-red-200' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(status, needsHelp)}
                          <Badge className={getSubjectColor(task.subject)}>
                            {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        {status !== 'not-started' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Fremskridt</span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span className={overdue && status !== 'completed' ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              Afleveringsfrist: {task.dueDate.toLocaleDateString('da-DK')}
                              {overdue && status !== 'completed' && ' (Overskredet)'}
                            </span>
                          </div>
                        )}

                        {/* Last Saved */}
                        {submission?.lastSaved && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Sidst gemt: {submission.lastSaved.toLocaleString('da-DK')}
                            </span>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-2">
                          <Link href={`/student/${task.id}`}>
                            <Button className="w-full">
                              {status === 'not-started' ? 'Start Opgave' : 
                               status === 'completed' ? 'Se Opgave' : 'Fortsæt Opgave'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <AuthGuard requiredRole="student">
      <StudentDashboardContent />
    </AuthGuard>
  );
}
