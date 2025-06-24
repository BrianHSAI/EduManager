"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Users, FileText, HelpCircle } from "lucide-react";
import { DashboardStats as StatsType } from "@/hooks/use-dashboard-data";

interface DashboardStatsProps {
  stats: StatsType;
  loading: boolean;
  onNavigate: (tab: string) => void;
}

export function DashboardStats({ stats, loading, onNavigate }: DashboardStatsProps) {
  const dashboardStats = [
    {
      title: "Aktive Grupper",
      value: stats.totalGroups,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      navigateTo: "groups",
    },
    {
      title: "Samlede Elever",
      value: stats.totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      navigateTo: "groups", // Students are managed within groups
    },
    {
      title: "Aktive Opgaver",
      value: stats.totalTasks,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      navigateTo: "tasks",
    },
    {
      title: "Hjælp Anmodninger",
      value: stats.helpRequests,
      icon: HelpCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      navigateTo: "help-requests",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onNavigate(stat.navigateTo)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
