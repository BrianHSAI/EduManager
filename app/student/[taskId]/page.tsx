"use client";

import { StudentTaskInterface } from '@/components/student-task-interface';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

interface StudentPageProps {
  params: {
    taskId: string;
  };
}

function StudentTaskPageContent({ params }: StudentPageProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Indlæser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <Link href="/student">
          <Button variant="outline">
            ← Tilbage til mine opgaver
          </Button>
        </Link>
      </div>
      <StudentTaskInterface taskId={params.taskId} studentId={user.id} />
    </div>
  );
}

export default function StudentPage({ params }: StudentPageProps) {
  return (
    <AuthGuard requiredRole="student">
      <StudentTaskPageContent params={params} />
    </AuthGuard>
  );
}
