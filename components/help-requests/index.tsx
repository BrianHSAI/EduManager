"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { createHelpMessage } from '@/lib/database/help-messages';
import { useHelpRequestsData } from '@/hooks/use-help-requests-data';
import { HelpRequestList } from './help-request-list';
import { HelpRequestStats } from './help-request-stats';
import { HelpResponseDialog } from './help-response-dialog';

export function HelpRequests() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; taskTitle: string } | null>(null);
  const { helpRequests, loading, refetch: fetchHelpRequests } = useHelpRequestsData();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleProvideHelp = async (submissionId: string, response: string) => {
    if (!user) return;

    try {
      // Find the submission to get student info
      const helpRequest = helpRequests.find(req => req.submission.id === submissionId);
      if (!helpRequest) {
        throw new Error('Help request not found');
      }

      // Create a teacher help message
      const teacherHelpMessage = await createHelpMessage({
        submissionId,
        studentId: helpRequest.student.id,
        teacherId: user.id,
        message: response,
        urgency: 'medium',
        category: 'other',
        isFromStudent: false
      });

      if (!teacherHelpMessage) {
        throw new Error('Failed to create help message');
      }

      // Update the submission to indicate help was provided and student has unread help
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          needs_help: false,
          has_unread_help: true
        })
        .eq('id', submissionId);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Hjælp sendt",
        description: "Din hjælp er blevet sendt til eleven.",
      });
      
      // Refresh the help requests
      fetchHelpRequests();
    } catch (error) {
      console.error('Error providing help:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke sende hjælp.",
        variant: "destructive",
      });
    }
  };

  const handleMarkResolved = async (submissionId: string) => {
    try {
      // Mark as resolved by setting needs_help to false
      // This will remove it from help requests, but if student writes again, it will reappear
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          needs_help: false,
          has_unread_help: false 
        })
        .eq('id', submissionId);

      if (error) {
        throw error;
      }

      toast({
        title: "Markeret som løst",
        description: "Hjælp anmodningen er markeret som løst.",
      });

      // Refresh the help requests
      fetchHelpRequests();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke markere som løst.",
        variant: "destructive",
      });
    }
  };

  const handleViewWork = (taskId: string, studentId: string) => {
    // Navigate to the student's work
    window.open(`/student/${taskId}?preview=true&student=${studentId}`, '_blank');
  };

  const handleProvideHelpClick = (submissionId: string) => {
    const helpRequest = helpRequests.find(req => req.submission.id === submissionId);
    if (helpRequest) {
      setSelectedSubmission(submissionId);
      setSelectedStudent({
        name: helpRequest.student.name,
        taskTitle: helpRequest.task.title
      });
    }
  };

  const handleSendHelp = (response: string) => {
    if (selectedSubmission) {
      handleProvideHelp(selectedSubmission, response);
      setSelectedSubmission(null);
      setSelectedStudent(null);
    }
  };

  const handleCloseDialog = () => {
    setSelectedSubmission(null);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hjælp Anmodninger</h1>
            <p className="text-muted-foreground mt-2">
              Indlæser hjælp anmodninger...
            </p>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Indlæser hjælp anmodninger...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hjælp Anmodninger</h1>
          <p className="text-muted-foreground mt-2">
            Elever der har brug for din hjælp
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {helpRequests.length} aktive anmodninger
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchHelpRequests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Opdater
          </Button>
        </div>
      </div>

      <HelpRequestList
        helpRequests={helpRequests}
        onViewWork={handleViewWork}
        onProvideHelp={handleProvideHelpClick}
        onMarkResolved={handleMarkResolved}
      />

      <HelpRequestStats helpRequests={helpRequests} />

      <HelpResponseDialog
        isOpen={selectedSubmission !== null}
        onClose={handleCloseDialog}
        studentName={selectedStudent?.name || ''}
        taskTitle={selectedStudent?.taskTitle || ''}
        onSendHelp={handleSendHelp}
      />
    </div>
  );
}
