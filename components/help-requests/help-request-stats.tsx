"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Clock, User } from 'lucide-react';
import { TaskSubmission, Task, User as AppUser } from '@/lib/types';

interface HelpRequestData {
  submission: TaskSubmission;
  student: AppUser;
  task: Task;
}

interface HelpRequestStatsProps {
  helpRequests: HelpRequestData[];
}

export function HelpRequestStats({ helpRequests }: HelpRequestStatsProps) {
  const averageWaitTime = helpRequests.length > 0 ? 
    Math.round(helpRequests.reduce((acc, { submission }) => {
      const timeAgo = new Date().getTime() - new Date(submission.lastSaved).getTime();
      return acc + timeAgo / (1000 * 60 * 60);
    }, 0) / helpRequests.length * 10) / 10 : 0;

  const mostCommonSubject = (() => {
    if (helpRequests.length === 0) return 'Ingen';
    
    const subjectCounts = helpRequests.reduce((acc, { task }) => {
      acc[task.subject] = (acc[task.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.keys(subjectCounts).reduce((a, b) => 
      subjectCounts[a] > subjectCounts[b] ? a : b
    );
    
    return mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1);
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive Anmodninger</CardTitle>
          <HelpCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{helpRequests.length}</div>
          <p className="text-xs text-muted-foreground">
            Elever der venter på hjælp
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gennemsnitlig Ventetid</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageWaitTime}t
          </div>
          <p className="text-xs text-muted-foreground">
            Siden anmodning blev sendt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mest Hjælp Behov</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostCommonSubject}
          </div>
          <p className="text-xs text-muted-foreground">
            Fag med flest anmodninger
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
