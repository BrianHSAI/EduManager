"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Users,
  FileText,
  Calendar,
  Download,
  FileDown
} from 'lucide-react';
import { Task, TaskSubmission, User } from '@/lib/types';
import { getSubmissionsByTask } from '@/lib/database/submissions';
import { getUserById } from '@/lib/database/users';
import { exportSubmission, exportAllSubmissions, exportAllSubmissionsAsZipFile, ExportFormat } from '@/lib/export';
import { ExportFormatDialog } from '@/components/export-format-dialog';
import { SubmissionPreviewDialog } from '@/components/submission-preview-dialog';

const getStatusColor = (status: TaskSubmission['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'needs-help':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: TaskSubmission['status']) => {
  switch (status) {
    case 'completed':
      return 'Færdig';
    case 'in-progress':
      return 'I gang';
    case 'needs-help':
      return 'Har brug for hjælp';
    default:
      return 'Ikke startet';
  }
};

interface TaskSubmissionsViewProps {
  task: Task;
  onViewSubmission: (submission: TaskSubmission, student: User) => void;
}

export function TaskSubmissionsView({ task, onViewSubmission }: TaskSubmissionsViewProps) {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [students, setStudents] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'single'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<{ submission: TaskSubmission; student: User } | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        const taskSubmissions = await getSubmissionsByTask(task.id);
        setSubmissions(taskSubmissions);

        // Load student data for each submission
        const studentData: Record<string, User> = {};
        for (const submission of taskSubmissions) {
          if (!studentData[submission.studentId]) {
            const student = await getUserById(submission.studentId);
            if (student) {
              studentData[submission.studentId] = student;
            }
          }
        }
        setStudents(studentData);
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissions();
  }, [task.id]);

  const completedSubmissions = submissions.filter(s => s.status === 'completed');
  const inProgressSubmissions = submissions.filter(s => s.status === 'in-progress');
  const helpRequestSubmissions = submissions.filter(s => s.needsHelp);
  const notStartedCount = Math.max(0, task.assignedStudents.length - submissions.length);

  const overallProgress = submissions.length > 0 
    ? (completedSubmissions.length / task.assignedStudents.length) * 100 
    : 0;

  const handleExport = async (format: ExportFormat, asZip?: boolean) => {
    try {
      let success = false;
      
      if (exportType === 'all') {
        if (asZip) {
          success = await exportAllSubmissionsAsZipFile(task, submissions, students, format);
        } else {
          success = await exportAllSubmissions(task, submissions, students, format);
        }
      } else if (selectedSubmission) {
        success = await exportSubmission(task, selectedSubmission.submission, selectedSubmission.student, format);
      }
      
      if (!success) {
        alert('Der opstod en fejl ved eksport');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Der opstod en fejl ved eksport');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Indlæser besvarelser...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <CardDescription className="mt-1">{task.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
              </Badge>
              {task.dueDate && (
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  {task.dueDate.toLocaleDateString('da-DK')}
                </Badge>
              )}
              {submissions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExportType('all');
                    setShowExportDialog(true);
                  }}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Eksporter alle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedSubmissions.length}</div>
              <div className="text-sm text-muted-foreground">Færdige</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressSubmissions.length}</div>
              <div className="text-sm text-muted-foreground">I gang</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{helpRequestSubmissions.length}</div>
              <div className="text-sm text-muted-foreground">Har brug for hjælp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{notStartedCount}</div>
              <div className="text-sm text-muted-foreground">Ikke startet</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Samlet fremskridt</span>
              <span>{Math.round(overallProgress)}% færdig</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Submissions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Alle ({submissions.length})</TabsTrigger>
          <TabsTrigger value="completed">Færdige ({completedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="in-progress">I gang ({inProgressSubmissions.length})</TabsTrigger>
          <TabsTrigger value="help">Hjælp ({helpRequestSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <SubmissionsList 
            submissions={submissions} 
            students={students} 
            onViewSubmission={onViewSubmission}
            task={task}
            onExportSubmission={(submission, student) => {
              setSelectedSubmission({ submission, student });
              setExportType('single');
              setShowExportDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <SubmissionsList 
            submissions={completedSubmissions} 
            students={students} 
            onViewSubmission={onViewSubmission}
            task={task}
            onExportSubmission={(submission, student) => {
              setSelectedSubmission({ submission, student });
              setExportType('single');
              setShowExportDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <SubmissionsList 
            submissions={inProgressSubmissions} 
            students={students} 
            onViewSubmission={onViewSubmission}
            task={task}
            onExportSubmission={(submission, student) => {
              setSelectedSubmission({ submission, student });
              setExportType('single');
              setShowExportDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <SubmissionsList 
            submissions={helpRequestSubmissions} 
            students={students} 
            onViewSubmission={onViewSubmission}
            task={task}
            onExportSubmission={(submission, student) => {
              setSelectedSubmission({ submission, student });
              setExportType('single');
              setShowExportDialog(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Export Format Dialog */}
      <ExportFormatDialog
        isOpen={showExportDialog}
        onClose={() => {
          setShowExportDialog(false);
          setSelectedSubmission(null);
        }}
        onExport={handleExport}
        title={exportType === 'all' ? 'Eksporter alle besvarelser' : 'Eksporter besvarelse'}
        description={
          exportType === 'all' 
            ? 'Vælg format og eksport muligheder for alle besvarelser'
            : `Vælg format for eksport af ${selectedSubmission?.student.name}'s besvarelse`
        }
        showZipOption={exportType === 'all'}
      />
    </div>
  );
}

interface SubmissionsListProps {
  submissions: TaskSubmission[];
  students: Record<string, User>;
  onViewSubmission: (submission: TaskSubmission, student: User) => void;
  task?: Task;
  onExportSubmission?: (submission: TaskSubmission, student: User) => void;
}

function SubmissionsList({ submissions, students, onViewSubmission, task, onExportSubmission }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Ingen besvarelser</h3>
            <p className="text-muted-foreground">
              Der er ingen besvarelser i denne kategori endnu.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const student = students[submission.studentId];
        if (!student) return null;

        return (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(submission.status)} text-white`}
                      >
                        {getStatusText(submission.status)}
                      </Badge>
                      {submission.needsHelp && (
                        <Badge variant="destructive">
                          <HelpCircle className="h-3 w-3 mr-1" />
                          Hjælp
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {Math.round(submission.progress)}% færdig
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Sidst gemt: {submission.lastSaved.toLocaleDateString('da-DK')}</span>
                    </div>
                    {submission.submittedAt && (
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Indsendt: {submission.submittedAt.toLocaleDateString('da-DK')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubmission(submission, student)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Se besvarelse
                    </Button>
                    
                    {task && onExportSubmission && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExportSubmission(submission, student)}
                        title="Eksporter"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {submission.progress > 0 && (
                <div className="mt-4">
                  <Progress value={submission.progress} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
