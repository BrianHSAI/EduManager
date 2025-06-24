"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { TaskSubmission, Task, User as AppUser } from '@/lib/types';
import { getHelpMessagesBySubmission } from '@/lib/database/help-messages';

export interface HelpRequestData {
  submission: TaskSubmission;
  student: AppUser;
  task: Task;
}

export function useHelpRequestsData() {
  const [helpRequests, setHelpRequests] = useState<HelpRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHelpRequests = async () => {
    if (!user || user.role !== 'teacher') return;

    try {
      setLoading(true);
      
      // Get all submissions that need help for tasks created by this teacher
      // Exclude submissions that are completed or submitted
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!inner (
            id,
            title,
            description,
            subject,
            fields,
            teacher_id
          ),
          users!task_submissions_student_id_fkey (
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('needs_help', true)
        .eq('tasks.teacher_id', user.id)
        .not('status', 'in', '(completed,submitted)');

      if (submissionsError) {
        console.error('Error fetching help requests:', submissionsError);
        toast({
          title: "Fejl",
          description: "Kunne ikke hente hjælp anmodninger.",
          variant: "destructive",
        });
        return;
      }

      const helpRequestsData: HelpRequestData[] = await Promise.all(
        submissions.map(async (sub: any) => {
          // Get help messages for this submission
          const helpMessages = await getHelpMessagesBySubmission(sub.id);
          
          return {
            submission: {
              id: sub.id,
              taskId: sub.task_id,
              studentId: sub.student_id,
              answers: sub.answers,
              status: sub.status,
              needsHelp: sub.needs_help,
              lastSaved: new Date(sub.last_saved),
              submittedAt: sub.submitted_at ? new Date(sub.submitted_at) : undefined,
              progress: sub.progress,
              helpMessages,
              hasUnreadHelp: sub.has_unread_help
            },
            student: {
              id: sub.users.id,
              name: sub.users.name,
              email: sub.users.email,
              role: 'student' as const,
              avatar: sub.users.avatar
            },
            task: {
              id: sub.tasks.id,
              title: sub.tasks.title,
              description: sub.tasks.description,
              subject: sub.tasks.subject,
              fields: sub.tasks.fields,
              teacherId: sub.tasks.teacher_id,
              assignedStudents: [],
              assignmentType: 'class' as const,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };
        })
      );

      setHelpRequests(helpRequestsData);
    } catch (error) {
      console.error('Error fetching help requests:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke hente hjælp anmodninger.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpRequests();
    
    // Set up auto-refresh every 15 seconds for help requests (more frequent than dashboard)
    const interval = setInterval(() => {
      fetchHelpRequests();
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    helpRequests,
    loading,
    refetch: fetchHelpRequests,
    helpRequestsCount: helpRequests.length
  };
}
