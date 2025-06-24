"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useHelpRequestsData } from "@/hooks/use-help-requests-data";

export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  totalTasks: number;
  helpRequests: number;
  completedSubmissions: number;
  inProgressSubmissions: number;
}

export interface RecentActivity {
  id: string;
  name: string;
  subject: string;
  status: string;
  statusColor: string;
  lastSaved: string;
}

export interface TaskStatus {
  name: string;
  completed: number;
  total: number;
  progress: number;
}

export function useDashboardData() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { helpRequestsCount } = useHelpRequestsData();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalStudents: 0,
    totalTasks: 0,
    helpRequests: 0,
    completedSubmissions: 0,
    inProgressSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus[]>([]);

  const fetchDashboardData = async () => {
    if (!currentUser || currentUser.role !== "teacher") return;

    try {
      setLoading(true);

      // Fetch groups
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select(
          `
          id,
          name,
          group_members (
            student_id
          )
        `
        )
        .eq("teacher_id", currentUser.id);

      if (groupsError) throw groupsError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, subject, created_at")
        .eq("teacher_id", currentUser.id);

      if (tasksError) throw tasksError;

      // Fetch submissions for help requests and statistics
      const { data: submissions, error: submissionsError } = await supabase
        .from("task_submissions")
        .select(
          `
          id,
          status,
          needs_help,
          progress,
          last_saved,
          submitted_at,
          tasks!inner (
            id,
            title,
            subject,
            teacher_id
          ),
          users!task_submissions_student_id_fkey (
            id,
            name,
            email
          )
        `
        )
        .eq("tasks.teacher_id", currentUser.id);

      if (submissionsError) throw submissionsError;

      // Calculate statistics
      const totalGroups = groups?.length || 0;
      const totalStudents =
        groups?.reduce(
          (acc: number, group: any) => acc + (group.group_members?.length || 0),
          0
        ) || 0;
      const totalTasks = tasks?.length || 0;
      // Use help requests count from the shared hook instead of calculating here
      const completedSubmissions =
        submissions?.filter((s: any) => s.status === "completed").length || 0;
      const inProgressSubmissions =
        submissions?.filter((s: any) => s.status === "in-progress").length || 0;

      setStats({
        totalGroups,
        totalStudents,
        totalTasks,
        helpRequests: helpRequestsCount,
        completedSubmissions,
        inProgressSubmissions,
      });

      // Recent activity (last 10 submissions)
      const recentSubmissions =
        submissions
          ?.sort(
            (a: any, b: any) =>
              new Date(b.last_saved).getTime() -
              new Date(a.last_saved).getTime()
          )
          .slice(0, 10)
          .map((sub: any) => ({
            id: sub.id,
            name: sub.users.name,
            subject: sub.tasks.title,
            status:
              sub.status === "completed"
                ? "Færdig"
                : sub.status === "in-progress"
                ? "I gang"
                : "Ikke startet",
            statusColor:
              sub.status === "completed"
                ? "bg-green-600"
                : sub.status === "in-progress"
                ? "bg-yellow-600"
                : "bg-gray-600",
            lastSaved: sub.last_saved,
          })) || [];

      setRecentActivity(recentSubmissions);

      // Task status overview
      const taskStatusData =
        tasks?.map((task: any) => {
          const taskSubmissions =
            submissions?.filter((s: any) => s.tasks.id === task.id) || [];
          const completed = taskSubmissions.filter(
            (s: any) => s.status === "completed"
          ).length;
          const total = taskSubmissions.length;
          const progress =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            name: task.title,
            completed,
            total,
            progress,
          };
        }) || [];

      setTaskStatus(taskStatusData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Fejl",
        description: "Kunne ikke hente dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return {
    loading,
    stats,
    recentActivity,
    taskStatus,
    refetch: fetchDashboardData,
  };
}
