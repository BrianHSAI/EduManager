"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskSubmission, User } from '@/lib/types';
import { Calendar, Clock, CheckCircle, User as UserIcon } from 'lucide-react';

interface SubmissionPreviewDialogProps {
  task: Task;
  submission: TaskSubmission;
  student: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionPreviewDialog({ 
  task, 
  submission, 
  student, 
  open, 
  onOpenChange 
}: SubmissionPreviewDialogProps) {
  const getStatusColor = (status: TaskSubmission['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'needs-help':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  const renderFieldAnswer = (field: any, answer: any) => {
    if (!answer && answer !== false && answer !== 0) {
      return <em className="text-muted-foreground">Ikke besvaret</em>;
    }

    switch (field.type) {
      case 'multiple-choice':
        return <span className="font-medium">{answer}</span>;
      case 'checkbox':
        return (
          <Badge variant={answer ? "default" : "secondary"}>
            {answer ? 'Ja' : 'Nej'}
          </Badge>
        );
      case 'number':
        return <span className="font-mono">{answer}</span>;
      case 'date':
        return <span>{new Date(answer).toLocaleDateString('da-DK')}</span>;
      case 'textarea':
        return (
          <div className="whitespace-pre-wrap bg-muted/50 p-3 rounded-md border">
            {answer}
          </div>
        );
      default:
        return (
          <div className="bg-muted/50 p-3 rounded-md border">
            {answer}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Besvarelse: {task.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
              </Badge>
              <Badge className={getStatusColor(submission.status)}>
                {getStatusText(submission.status)}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Student and Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Elevoplysninger</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Elev</Label>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fremskridt</Label>
                    <p className="font-medium">{Math.round(submission.progress)}% færdig</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sidst gemt</Label>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{submission.lastSaved.toLocaleString('da-DK')}</span>
                    </div>
                  </div>
                  {submission.submittedAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Indsendt</Label>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{submission.submittedAt.toLocaleString('da-DK')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Description */}
            <Card>
              <CardHeader>
                <CardTitle>Opgavebeskrivelse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{task.description}</p>
              </CardContent>
            </Card>

            {/* Answers */}
            <Card>
              <CardHeader>
                <CardTitle>Elevens Svar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {task.fields.map((field, index) => {
                    const answer = submission.answers[field.id];
                    return (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm font-medium">
                            {index + 1}. {field.label}
                          </Label>
                          {field.required && (
                            <Badge variant="outline" className="text-xs">
                              Påkrævet
                            </Badge>
                          )}
                        </div>
                        <div className="pl-4">
                          {renderFieldAnswer(field, answer)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Help Messages if any */}
            {submission.helpMessages && submission.helpMessages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hjælp Beskeder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submission.helpMessages
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border-l-4 ${
                          message.isFromStudent 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'bg-green-50 border-green-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={message.isFromStudent ? "default" : "secondary"}>
                              {message.isFromStudent ? 'Elev' : 'Lærer'}
                            </Badge>
                            {message.isFromStudent && (
                              <Badge variant="outline" className="text-xs">
                                {message.urgency === 'high' ? 'Hurtigt' : 
                                 message.urgency === 'medium' ? 'Moderat' : 'Ikke travlt'}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('da-DK')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
