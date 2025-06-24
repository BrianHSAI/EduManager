import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, Save, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskHeaderProps {
  task: Task;
  progress: number;
  isSubmitted: boolean;
  needsHelp: boolean;
  lastSaved: Date | null;
}

export function TaskHeader({ task, progress, isSubmitted, needsHelp, lastSaved }: TaskHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <CardDescription className="mt-2">{task.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
            </Badge>
            {isSubmitted && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Indsendt
              </Badge>
            )}
            {needsHelp && (
              <Badge variant="destructive">
                <HelpCircle className="h-3 w-3 mr-1" />
                Hjælp anmodet
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fremskridt</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% færdig
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {task.dueDate && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Afleveringsfrist: {task.dueDate.toLocaleDateString('da-DK')}</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Save className="h-4 w-4" />
              <span>Sidst gemt: {lastSaved.toLocaleString('da-DK')}</span>
            </div>
          )}

          {/* Resources Section */}
          {task.resources && task.resources.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Nyttige links og ressourcer:</h4>
              <div className="space-y-2">
                {task.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{resource.title}</div>
                      {resource.description && (
                        <div className="text-xs text-muted-foreground mt-1">{resource.description}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                      className="ml-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
