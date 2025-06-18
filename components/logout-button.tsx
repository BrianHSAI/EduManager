"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    router.push('/login');
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant={variant}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Log ud
    </Button>
  );
}
