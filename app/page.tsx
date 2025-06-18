"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // Redirect based on user role
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
    } else {
      // No user logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Omdirigerer...</p>
      </div>
    </div>
  );
}
