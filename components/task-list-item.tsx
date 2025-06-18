"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar,
  Users,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Task, Group } from '@/lib/types';
import Link from 'next/link';

interface TaskStats {
  completed: number;
  inProgress: number;
  needsHelp: number;
  notStarted: number;
  total: number;
}

interface TaskListItemProps {
  task: Task;
  group?: Group;
  stats: TaskStats;
}

export function TaskListItem({ task, group, stats }: TaskListItemProps) {
  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
            </Badge>
            {task.assignmentType === 'individual' && (
              <Badge variant="secondary">Individuel</Badge>
            )}
            <Link href={`/teacher/preview/${task.id}`}>
              <Button 
                variant="ghost" 
                size="sm"
                title="Forhåndsvis elevvisning"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {task.assignmentType === 'class' ? group?.name : `${task.assignedStudents.length} elever`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {task.dueDate ? 
                `Frist: ${task.dueDate.toLocaleDateString('da-DK')}` : 
                'Ingen frist'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Oprettet {task.createdAt.toLocaleDateString('da-DK')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fremskridt</span>
            <span className="text-sm text-muted-foreground">
              {stats.completed} af {stats.total} færdige
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{stats.completed} færdige</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{stats.inProgress} i gang</span>
            </div>
            {stats.needsHelp > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">{stats.needsHelp} har brug for hjælp</span>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            Se Besvarelser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
