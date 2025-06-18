"use client";

import { TeacherView } from '@/components/teacher-view';
import { AuthGuard } from '@/components/auth-guard';

export default function TeacherDashboard() {
  return (
    <AuthGuard requiredRole="teacher">
      <TeacherView />
    </AuthGuard>
  );
}
