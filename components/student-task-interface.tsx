"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Task, HelpMessage } from '@/lib/types';
import { getTaskById } from '@/lib/database/tasks';
import { getSubmission, upsertSubmission } from '@/lib/database/submissions';
import { createHelpMessage, getHelpMessagesBySubmission, removeHelpRequest } from '@/lib/database/help-messages';
import { TaskHeader } from './student-task/task-header';
import { TaskFieldRenderer } from './student-task/task-field-renderer';
import { TaskActions } from './student-task/task-actions';
import { calculateTaskProgress, canSubmitTask } from './student-task/task-progress-tracker';

interface StudentTaskInterfaceProps {
  taskId: string;
  studentId: string;
  previewMode?: boolean;
}

export function StudentTaskInterface({ taskId, studentId, previewMode = false }: StudentTaskInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [needsHelp, setNeedsHelp] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([]);
  const [hasUnreadHelp, setHasUnreadHelp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTaskAndSubmission = async () => {
      try {
        setIsLoading(true);
        const [taskData, existingSubmission] = await Promise.all([
          getTaskById(taskId),
          getSubmission(taskId, studentId)
        ]);
        
        setTask(taskData);
        
        if (existingSubmission) {
          setAnswers(existingSubmission.answers || {});
          setNeedsHelp(existingSubmission.needsHelp);
          setLastSaved(existingSubmission.lastSaved);
          setIsSubmitted(existingSubmission.status === 'completed');
          setHasUnreadHelp(existingSubmission.hasUnreadHelp || false);
          
          // Load help messages
          const messages = await getHelpMessagesBySubmission(existingSubmission.id);
          setHelpMessages(messages);
        }
      } catch (error) {
        console.error('Error loading task and submission:', error);
        toast({
          title: "Fejl",
          description: "Kunne ikke indlæse opgaven. Prøv igen senere.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!previewMode) {
      loadTaskAndSubmission();
    } else {
      // In preview mode, just load the task
      const loadTask = async () => {
        try {
          setIsLoading(true);
          const taskData = await getTaskById(taskId);
          setTask(taskData);
        } catch (error) {
          console.error('Error loading task:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadTask();
    }
  }, [taskId, studentId, previewMode, toast]);

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = async () => {
    if (previewMode || !task) return;
    
    try {
      setIsSaving(true);
      const progress = calculateTaskProgress(task.fields, answers);
      
      const submissionData = {
        taskId,
        studentId,
        answers,
        status: 'in-progress' as const,
        needsHelp,
        progress,
        submittedAt: undefined
      };

      const result = await upsertSubmission(submissionData);
      
      if (result) {
        setLastSaved(new Date());
        toast({
          title: "Gemt",
          description: "Dit arbejde er blevet gemt.",
        });
      } else {
        throw new Error('Failed to save submission');
      }
    } catch (error) {
      console.error('Error saving work:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme dit arbejde. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (previewMode || !task || !canSubmitTask(task.fields, answers)) return;
    
    try {
      setIsSubmitting(true);
      
      const submissionData = {
        taskId,
        studentId,
        answers,
        status: 'completed' as const,
        needsHelp: false, // Remove help request when submitting
        progress: 100,
        submittedAt: new Date()
      };

      const result = await upsertSubmission(submissionData);
      
      if (result) {
        // Remove help request from the submission
        if (needsHelp) {
          await removeHelpRequest(result.id);
        }
        
        setIsSubmitted(true);
        setNeedsHelp(false); // Update local state
        setLastSaved(new Date());
        toast({
          title: "Indsendt",
          description: "Din opgave er blevet indsendt til læreren.",
        });
      } else {
        throw new Error('Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke indsende opgaven. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpRequested = async (helpData: {
    urgency: string;
    category: string;
    description: string;
  }) => {
    if (previewMode || !task) return;
    
    try {
      setNeedsHelp(true);
      
      // First, save/update the submission to get the submission ID
      const progress = calculateTaskProgress(task.fields, answers);
      const submissionData = {
        taskId,
        studentId,
        answers,
        status: 'in-progress' as const,
        needsHelp: true,
        progress,
        submittedAt: undefined
      };

      const submission = await upsertSubmission(submissionData);
      if (!submission) {
        throw new Error('Failed to save submission');
      }

      // Create the help message in the database
      const helpMessage = await createHelpMessage({
        submissionId: submission.id,
        studentId,
        message: helpData.description,
        urgency: helpData.urgency as 'low' | 'medium' | 'high',
        category: helpData.category as 'understanding' | 'technical' | 'content' | 'other',
        isFromStudent: true
      });

      if (helpMessage) {
        setHelpMessages(prev => [...prev, helpMessage]);
      }
      
      toast({
        title: "Hjælp anmodet",
        description: "Din anmodning om hjælp er sendt til læreren.",
      });
    } catch (error) {
      console.error('Error requesting help:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke sende hjælp anmodning. Prøv igen.",
        variant: "destructive",
      });
    }
  };

  const handleRequestMoreHelp = async (message: string) => {
    if (previewMode || !task) return;
    
    try {
      setNeedsHelp(true);
      
      // Get the current submission
      const existingSubmission = await getSubmission(taskId, studentId);
      if (!existingSubmission) {
        throw new Error('No submission found');
      }

      // Create the help message in the database
      const helpMessage = await createHelpMessage({
        submissionId: existingSubmission.id,
        studentId,
        message,
        urgency: 'medium',
        category: 'other',
        isFromStudent: true
      });

      if (helpMessage) {
        setHelpMessages(prev => [...prev, helpMessage]);
      }

      // Update the submission to indicate help is needed again
      // This will make it reappear in the teacher's help requests even if it was previously marked as resolved
      const progress = calculateTaskProgress(task.fields, answers);
      const status = existingSubmission.status === 'completed' ? 'completed' : 'in-progress';
      const submissionData = {
        taskId,
        studentId,
        answers,
        status: status as 'completed' | 'in-progress',
        needsHelp: true,
        progress,
        submittedAt: existingSubmission.submittedAt
      };

      await upsertSubmission(submissionData);
      
      toast({
        title: "Mere hjælp anmodet",
        description: "Din anmodning om mere hjælp er sendt til læreren.",
      });
    } catch (error) {
      console.error('Error requesting more help:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke sende hjælp anmodning. Prøv igen.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Indlæser opgave...</h3>
            <p className="text-muted-foreground">
              Vent venligst mens opgaven indlæses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Opgave ikke fundet</h3>
            <p className="text-muted-foreground">
              Den anmodede opgave kunne ikke findes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateTaskProgress(task.fields, answers);
  const canSubmit = canSubmitTask(task.fields, answers);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Task Header */}
      <TaskHeader
        task={task}
        progress={progress}
        isSubmitted={isSubmitted}
        needsHelp={needsHelp}
        lastSaved={lastSaved}
      />

      {/* Task Fields */}
      <div className="space-y-6">
        {task.fields.map((field, index) => (
          <TaskFieldRenderer
            key={field.id}
            field={field}
            value={answers[field.id]}
            index={index}
            isDisabled={isSubmitted || previewMode}
            onValueChange={handleAnswerChange}
          />
        ))}
      </div>

      {/* Action Buttons */}
      {!previewMode && (
        <TaskActions
          task={task}
          answers={answers}
          studentId={studentId}
          isSubmitted={isSubmitted}
          needsHelp={needsHelp}
          canSubmit={canSubmit}
          isSaving={isSaving}
          isSubmitting={isSubmitting}
          onSave={handleSave}
          onSubmit={handleSubmit}
          helpMessages={helpMessages}
          hasUnreadHelp={hasUnreadHelp}
          onHelpRequested={handleHelpRequested}
          onRequestMoreHelp={handleRequestMoreHelp}
        />
      )}
    </div>
  );
}
