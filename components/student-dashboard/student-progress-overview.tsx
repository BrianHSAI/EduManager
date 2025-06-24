import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StudentProgressOverviewProps {
  completedTasks: number;
  totalTasks: number;
  overallProgress: number;
}

export function StudentProgressOverview({
  completedTasks,
  totalTasks,
  overallProgress
}: StudentProgressOverviewProps) {
  return (
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
  );
}
