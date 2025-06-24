"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from './auth-provider';

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const LogoutButton = React.forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ className, variant = "outline" }, ref) => {
    const { signOut } = useAuth();

    const handleLogout = async () => {
      await signOut();
    };

    return (
      <Button 
        ref={ref}
        onClick={handleLogout} 
        variant={variant}
        className={className}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Log ud
      </Button>
    );
  }
);

LogoutButton.displayName = 'LogoutButton';
