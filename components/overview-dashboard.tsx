"use client";

import { RefreshCw } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TaskStatusOverview } from "@/components/dashboard/task-status-overview";
import { HelpRequestsSummary } from "@/components/dashboard/help-requests-summary";
import { TeacherConnectionRequests } from "@/components/teacher-connection-requests";
import { useAuth } from "@/components/auth-provider";

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
}

export function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const { user: currentUser } = useAuth();
  const { loading, stats, recentActivity, taskStatus, refetch } = useDashboardData();

  // Handle case when no user exists (empty data)
  if (!currentUser) {
    return (
      <div className="space-y-6 p-6">
        <DashboardHeader onNavigate={onNavigate} onRefresh={refetch} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Indlæser dashboard...
            </h1>
            <p className="text-gray-600 mt-1">Henter dine data</p>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <DashboardStats stats={stats} loading={loading} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader onNavigate={onNavigate} onRefresh={refetch} />

      {/* Stats Grid */}
      <DashboardStats stats={stats} loading={loading} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />

        {/* Task Status Overview */}
        <TaskStatusOverview taskStatus={taskStatus} />
      </div>

      {/* Connection Requests */}
      <TeacherConnectionRequests />

      {/* Help Requests Summary */}
      <HelpRequestsSummary 
        helpRequestsCount={stats.helpRequests} 
        onNavigate={onNavigate} 
      />
    </div>
  );
}
