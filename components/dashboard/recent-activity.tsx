"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentActivity as ActivityType } from "@/hooks/use-dashboard-data";

interface RecentActivityProps {
  activities: ActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Seneste Aktivitet
        </CardTitle>
        <CardDescription className="text-gray-600">
          Nylige elevbesvarelser og opdateringer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {activity.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activity.subject}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`${activity.statusColor} text-white border-0`}
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Ingen aktivitet endnu</p>
            <p className="text-sm text-gray-400 mt-1">
              Aktivitet vil vises når elever begynder at arbejde på opgaver
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
