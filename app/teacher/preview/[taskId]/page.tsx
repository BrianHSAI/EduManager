"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StudentTaskInterface } from '@/components/student-task-interface';
import { getTaskById } from '@/lib/database/tasks';
import { Task } from '@/lib/types';
import Link from 'next/link';

interface PreviewPageProps {
  params: { taskId: string };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { taskId } = params;
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setIsLoading(true);
        const taskData = await getTaskById(taskId);
        setTask(taskData);
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Kunne ikke indlæse opgaven');
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Indlæser opgave...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Opgave ikke fundet</h1>
          <p className="text-muted-foreground mb-4">{error || 'Opgaven kunne ikke findes'}</p>
          <Link href="/teacher">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage til oversigt
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/teacher">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbage til lærervisning
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">Forhåndsvisning: {task.title}</h1>
                <p className="text-sm text-muted-foreground">Sådan ser opgaven ud for eleverne</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student view content */}
      <div className="py-8">
        <StudentTaskInterface 
          taskId={taskId} 
          studentId="preview" 
          previewMode={true}
        />
      </div>
    </div>
  );
}
