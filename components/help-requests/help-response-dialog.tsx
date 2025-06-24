"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HelpResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  taskTitle: string;
  onSendHelp: (response: string) => void;
}

export function HelpResponseDialog({
  isOpen,
  onClose,
  studentName,
  taskTitle,
  onSendHelp
}: HelpResponseDialogProps) {
  const [helpResponse, setHelpResponse] = useState('');

  const handleSend = () => {
    if (helpResponse.trim()) {
      onSendHelp(helpResponse.trim());
      setHelpResponse('');
      onClose();
    }
  };

  const handleClose = () => {
    setHelpResponse('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hjælp {studentName}</DialogTitle>
          <DialogDescription>
            Skriv en hjælpsom besked til eleven om opgaven "{taskTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="helpResponse">Din hjælp til eleven</Label>
            <Textarea
              id="helpResponse"
              value={helpResponse}
              onChange={(e) => setHelpResponse(e.target.value)}
              placeholder="Skriv din hjælp og vejledning her..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Annuller
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!helpResponse.trim()}
            >
              Send Hjælp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
