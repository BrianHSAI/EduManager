"use client";

import { User, Mail, Users } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { StudentInvitations } from "@/components/student-invitations";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import { StudentFolderCards } from "@/components/student-dashboard/student-folder-cards";
import { StudentProgressOverview } from "@/components/student-dashboard/student-progress-overview";
import { StudentTaskFilters } from "@/components/student-dashboard/student-task-filters";
import { StudentTaskList } from "@/components/student-dashboard/student-task-list";
import { StudentSubmissionDialog } from "@/components/student-dashboard/student-submission-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ConnectionRequestDialog } from "@/components/connection-request-dialog";
import { StudentConnectionRequests } from "@/components/student-connection-requests";
import { FolderCreationDialog } from "@/components/folder-creation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

function StudentDashboardContent() {
  const { user } = useAuth();
  const dashboard = useStudentDashboard(user?.id);
  const router = useRouter();
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);

  if (dashboard.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Indlæser...</p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (filter: string) => {
    dashboard.setStatusFilter(filter);
    dashboard.setShowDetailedView(filter);
  };

  const handleViewSubmission = (task: any, submission: any) => {
    dashboard.setSelectedSubmission({ task, submission });
  };

  const handleContactClick = () => {
    router.push("/kontakt");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mine Opgaver</h1>
            <p className="text-muted-foreground mt-1">
              Velkommen tilbage, {user?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <FolderCreationDialog onFolderCreated={dashboard.loadData} />
            <ConnectionRequestDialog />
            <Dialog
              open={showConnectionRequests}
              onOpenChange={setShowConnectionRequests}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Forbindelsesanmodninger</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mine Forbindelsesanmodninger</DialogTitle>
                </DialogHeader>
                <StudentConnectionRequests />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactClick}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm">Kontakt</span>
            </Button>
            <div className="flex items-center space-x-2"></div>
            <LogoutButton />
          </div>
        </div>

        {/* Student Invitations */}
        <StudentInvitations />

        {/* Folder Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mine Mapper</h2>
          </div>
          <StudentFolderCards
            folders={dashboard.folders}
            getFolderStatistics={dashboard.getFolderStatistics}
            onFolderClick={(folderId) => {
              dashboard.setStatusFilter("folder");
              dashboard.setShowDetailedView(folderId);
            }}
            onFolderUpdated={dashboard.loadData}
            activeFolderId={
              dashboard.statusFilter === "folder" && dashboard.showDetailedView
                ? dashboard.showDetailedView
                : null
            }
          />
        </div>

        {/* Overall Progress */}
        <StudentProgressOverview
          completedTasks={dashboard.completedTasks}
          totalTasks={dashboard.totalTasks}
          overallProgress={dashboard.overallProgress}
        />

        {/* Filters */}
        <StudentTaskFilters
          searchTerm={dashboard.searchTerm}
          setSearchTerm={dashboard.setSearchTerm}
          statusFilter={dashboard.statusFilter}
          setStatusFilter={dashboard.setStatusFilter}
          subjectFilter={dashboard.subjectFilter}
          setSubjectFilter={dashboard.setSubjectFilter}
        />

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {dashboard.statusFilter === "folder" &&
              dashboard.showDetailedView ? (
                <>
                  {dashboard.folders.find(
                    (f) => f.id === dashboard.showDetailedView
                  )?.name || "Mappe"}
                  <span className="text-muted-foreground ml-2">
                    ({dashboard.filteredTasks.length})
                  </span>
                </>
              ) : (
                `Opgaver (${dashboard.filteredTasks.length})`
              )}
            </h2>
            {dashboard.statusFilter === "folder" && dashboard.showDetailedView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dashboard.setStatusFilter("all");
                  dashboard.setShowDetailedView(null);
                }}
              >
                Vis alle opgaver
              </Button>
            )}
          </div>

          <StudentTaskList
            filteredTasks={dashboard.filteredTasks}
            submissionMap={dashboard.submissionMap}
            getTaskStatus={dashboard.getTaskStatus}
            getTaskProgress={dashboard.getTaskProgress}
            getStatusBadge={dashboard.getStatusBadge}
            getSubjectColor={dashboard.getSubjectColor}
            isOverdue={dashboard.isOverdue}
            onViewSubmission={handleViewSubmission}
            onFolderAssigned={dashboard.loadData}
          />
        </div>

        {/* Submission Dialog */}
        <StudentSubmissionDialog
          selectedSubmission={dashboard.selectedSubmission}
          onClose={() => dashboard.setSelectedSubmission(null)}
        />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <AuthGuard requiredRole="student">
      <StudentDashboardContent />
    </AuthGuard>
  );
}
