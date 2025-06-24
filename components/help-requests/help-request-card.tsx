"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  Clock, 
  MessageSquare,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { TaskSubmission, Task, User as AppUser } from '@/lib/types';

interface HelpRequestData {
  submission: TaskSubmission;
  student: AppUser;
  task: Task;
}

interface HelpRequestCardProps {
  helpRequest: HelpRequestData;
  onViewWork: (taskId: string, studentId: string) => void;
  onProvideHelp: (submissionId: string) => void;
  onMarkResolved: (submissionId: string) => void;
}

export function HelpRequestCard({
  helpRequest,
  onViewWork,
  onProvideHelp,
  onMarkResolved
}: HelpRequestCardProps) {
  const { submission, student, task } = helpRequest;
  
  const timeAgo = new Date().getTime() - new Date(submission.lastSaved).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
  const minutesAgo = Math.floor(timeAgo / (1000 * 60));

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                <HelpCircle className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">{student.name}</CardTitle>
              <CardDescription>{task.title}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {submission.helpMessages && submission.helpMessages.some(msg => !msg.isFromStudent) ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                Hjælp givet
              </Badge>
            ) : (
              <Badge variant="destructive">
                Hjælp anmodet
              </Badge>
            )}
            <Badge variant="outline">
              {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Anmodet for {hoursAgo > 0 ? `${hoursAgo} timer` : `${minutesAgo} minutter`} siden
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Fremskridt: {submission.progress}%
            </span>
          </div>
        </div>

        {/* Show student's help message */}
        {submission.helpMessages && submission.helpMessages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-3 text-blue-900">Elevens besked:</h4>
            <div className="space-y-3">
              {submission.helpMessages
                .filter(msg => msg.isFromStudent)
                .map((message) => (
                <div key={message.id} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {message.urgency === 'high' ? 'Hurtigt' : 
                         message.urgency === 'medium' ? 'Moderat' : 'Ikke travlt'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {message.category === 'understanding' ? 'Forståelse' :
                         message.category === 'technical' ? 'Teknisk' :
                         message.category === 'content' ? 'Indhold' : 'Andet'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString('da-DK')}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show current answers */}
        <div className="bg-background rounded-lg p-4 border">
          <h4 className="font-medium mb-3">Elevens nuværende arbejde:</h4>
          <div className="space-y-3">
            {task.fields.map((field) => {
              const answer = submission.answers[field.id];
              return (
                <div key={field.id} className="space-y-1">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {answer || <em>Ikke besvaret</em>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewWork(task.id, student.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Se Arbejde Live
          </Button>
          
          <Button 
            size="sm"
            onClick={() => onProvideHelp(submission.id)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Giv Hjælp
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMarkResolved(submission.id)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marker som Løst
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
