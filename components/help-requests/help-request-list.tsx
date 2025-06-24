"use client";

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { TaskSubmission, Task, User as AppUser } from '@/lib/types';
import { HelpRequestCard } from './help-request-card';

interface HelpRequestData {
  submission: TaskSubmission;
  student: AppUser;
  task: Task;
}

interface HelpRequestListProps {
  helpRequests: HelpRequestData[];
  onViewWork: (taskId: string, studentId: string) => void;
  onProvideHelp: (submissionId: string) => void;
  onMarkResolved: (submissionId: string) => void;
}

export function HelpRequestList({
  helpRequests,
  onViewWork,
  onProvideHelp,
  onMarkResolved
}: HelpRequestListProps) {
  if (helpRequests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Ingen hjælp anmodninger</h3>
          <p className="text-muted-foreground text-center">
            Alle dine elever klarer sig godt! Der er ingen aktive hjælp anmodninger.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {helpRequests.map((helpRequest) => (
        <HelpRequestCard
          key={helpRequest.submission.id}
          helpRequest={helpRequest}
          onViewWork={onViewWork}
          onProvideHelp={onProvideHelp}
          onMarkResolved={onMarkResolved}
        />
      ))}
    </div>
  );
}
