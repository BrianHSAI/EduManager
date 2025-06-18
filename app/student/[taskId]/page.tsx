"use client";

import { StudentTaskInterface } from '@/components/student-task-interface';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StudentPageProps {
  params: {
    taskId: string;
  };
}

export default function StudentPage({ params }: StudentPageProps) {
  // For demo purposes, we'll use student ID '2' (Emma Nielsen)
  const studentId = '2';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <Link href="/student">
          <Button variant="outline">
            ← Tilbage til mine opgaver
          </Button>
        </Link>
      </div>
      <StudentTaskInterface taskId={params.taskId} studentId={studentId} />
    </div>
  );
}
