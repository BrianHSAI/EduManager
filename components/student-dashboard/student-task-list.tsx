import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Task, TaskSubmission } from '@/lib/types';
import { StudentTaskCard } from './student-task-card';

interface StudentTaskListProps {
  filteredTasks: Task[];
  submissionMap: Map<string, TaskSubmission>;
  getTaskStatus: (task: Task) => string;
  getTaskProgress: (task: Task) => number;
  getStatusBadge: (status: string, needsHelp: boolean, helpMessages: any[]) => any;
  getSubjectColor: (subject: string) => string;
  isOverdue: (dueDate?: Date) => boolean;
  onViewSubmission: (task: Task, submission: TaskSubmission) => void;
}

export function StudentTaskList({
  filteredTasks,
  submissionMap,
  getTaskStatus,
  getTaskProgress,
  getStatusBadge,
  getSubjectColor,
  isOverdue,
  onViewSubmission
}: StudentTaskListProps) {
  if (filteredTasks.length === 0) {
    return (
      <Card>
        
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filteredTasks.map((task) => {
        const status = getTaskStatus(task);
        const progress = getTaskProgress(task);
        const submission = submissionMap.get(task.id);
        const needsHelp = submission?.needsHelp || false;
        const overdue = isOverdue(task.dueDate);

        return (
          <StudentTaskCard
            key={task.id}
            task={task}
            submission={submission}
            status={status}
            progress={progress}
            needsHelp={needsHelp}
            isOverdue={overdue}
            getStatusBadge={getStatusBadge}
            getSubjectColor={getSubjectColor}
            onViewSubmission={onViewSubmission}
          />
        );
      })}
    </div>
  );
}
