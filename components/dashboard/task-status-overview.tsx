"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TaskStatus as TaskStatusType } from "@/hooks/use-dashboard-data";

interface TaskStatusOverviewProps {
  taskStatus: TaskStatusType[];
}

export function TaskStatusOverview({ taskStatus }: TaskStatusOverviewProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Opgave Status
        </CardTitle>
        <CardDescription className="text-gray-600">
          Overblik over alle opgavebesvarelser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {taskStatus.length > 0 ? (
          taskStatus.map((task, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {task.completed} af {task.total} elever færdige
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  {task.progress}%
                </Badge>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Ingen opgaver endnu</p>
            <p className="text-sm text-gray-400 mt-1">
              Opret din første opgave for at se fremskridt
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
