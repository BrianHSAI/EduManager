"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StudentTaskInterface } from '@/components/student-task-interface';
import { getTaskById } from '@/lib/mock-data';
import Link from 'next/link';

interface PreviewPageProps {
  params: { taskId: string };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { taskId } = params;
  const task = getTaskById(taskId);

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Opgave ikke fundet</h1>
          <Link href="/">
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
              <Link href="/">
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
