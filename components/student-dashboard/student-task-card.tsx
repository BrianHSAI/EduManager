import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  HelpCircle,
  Calendar,
  FileText,
  MessageSquare,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Task, TaskSubmission } from '@/lib/types';

interface StudentTaskCardProps {
  task: Task;
  submission?: TaskSubmission;
  status: string;
  progress: number;
  needsHelp: boolean;
  isOverdue: boolean;
  getStatusBadge: (status: string, needsHelp: boolean, helpMessages: any[]) => any;
  getSubjectColor: (subject: string) => string;
  onViewSubmission: (task: Task, submission: TaskSubmission) => void;
}

export function StudentTaskCard({
  task,
  submission,
  status,
  progress,
  needsHelp,
  isOverdue,
  getStatusBadge,
  getSubjectColor,
  onViewSubmission
}: StudentTaskCardProps) {
  // Don't show help request badge for completed tasks
  const showHelpBadge = needsHelp && status !== 'completed';
  const statusBadge = getStatusBadge(status, showHelpBadge, submission?.helpMessages || []);

  const renderStatusBadge = () => {
    if (!statusBadge) return null;

    const iconMap = {
      'MessageSquare': MessageSquare,
      'HelpCircle': HelpCircle,
      'CheckCircle': CheckCircle,
      'Clock': Clock,
      'FileText': FileText
    } as const;
    
    const IconComponent = iconMap[statusBadge.icon as keyof typeof iconMap] || FileText;

    if (statusBadge.variant === 'orange') {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <IconComponent className="h-3 w-3 mr-1" />
          {statusBadge.text}
        </Badge>
      );
    }

    return (
      <Badge variant={statusBadge.variant as any}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusBadge.text}
      </Badge>
    );
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue && status !== 'completed' ? 'border-red-200' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {renderStatusBadge()}
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
              <span className={isOverdue && status !== 'completed' ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                Afleveringsfrist: {task.dueDate.toLocaleDateString('da-DK')}
                {isOverdue && status !== 'completed' && ' (Overskredet)'}
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

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <Link href={`/student/${task.id}`}>
              <Button className="w-full">
                {status === 'not-started' ? 'Start Opgave' : 
                 status === 'completed' ? 'Se Opgave' : 'Fortsæt Opgave'}
              </Button>
            </Link>
            
            {status === 'completed' && submission && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onViewSubmission(task, submission)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Se Besvarelse
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
