"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { OverviewDashboard } from '@/components/overview-dashboard';
import { GroupsManagement } from '@/components/groups-management';
import { TaskManagement } from '@/components/task-management';
import { HelpRequests } from '@/components/help-requests';

export function TeacherView() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard onNavigate={setActiveTab} />;
      case 'groups':
        return <GroupsManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'help-requests':
        return <HelpRequests />;
      default:
        return <OverviewDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
