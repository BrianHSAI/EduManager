"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, UserPlus, Loader2 } from 'lucide-react';

interface StudentInvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onInviteStudent: (email: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function StudentInvitationDialog({
  isOpen,
  onOpenChange,
  groupName,
  onInviteStudent,
  trigger
}: StudentInvitationDialogProps) {
  const [studentEmail, setStudentEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async () => {
    if (!studentEmail.trim() || isSending) return;
    
    try {
      setIsSending(true);
      await onInviteStudent(studentEmail.trim());
      setStudentEmail('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStudentEmail('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter Elev</DialogTitle>
          <DialogDescription>
            Send en invitation til en elev for at deltage i gruppen "{groupName}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="studentEmail">Elevens Email</Label>
            <Input
              id="studentEmail"
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="elev@skole.dk"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleInvite();
                }
              }}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Annuller
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={!studentEmail.trim() || isSending}
            >
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
