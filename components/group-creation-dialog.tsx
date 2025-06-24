"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';

interface GroupCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (name: string, description?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function GroupCreationDialog({ 
  isOpen, 
  onOpenChange, 
  onCreateGroup, 
  trigger 
}: GroupCreationDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || isCreating) return;
    
    try {
      setIsCreating(true);
      await onCreateGroup(groupName.trim(), groupDescription.trim() || undefined);
      
      // Reset form and close dialog
      setGroupName('');
      setGroupDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setGroupName('');
      setGroupDescription('');
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
          <DialogTitle>Opret Ny Gruppe</DialogTitle>
          <DialogDescription>
            Opret en ny gruppe til dine elever
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Gruppe Navn</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="f.eks. 7A Matematik"
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="groupDescription">Beskrivelse (valgfri)</Label>
            <Textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Beskrivelse af gruppen..."
              disabled={isCreating}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Annuller
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!groupName.trim() || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Opret Gruppe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
