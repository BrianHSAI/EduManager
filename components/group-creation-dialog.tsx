"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';

interface NewGroupData {
  name: string;
  description: string;
}

interface GroupCreationDialogProps {
  onCreateGroup: (groupData: NewGroupData) => void;
  trigger?: React.ReactNode;
}

export function GroupCreationDialog({ onCreateGroup, trigger }: GroupCreationDialogProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState<NewGroupData>({
    name: '',
    description: ''
  });

  const handleCreateGroup = () => {
    onCreateGroup(newGroup);
    setShowCreateGroup(false);
    setNewGroup({ name: '', description: '' });
  };

  const isFormValid = () => {
    return newGroup.name.trim().length > 0;
  };

  return (
    <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Opret Gruppe
          </Button>
        )}
      </DialogTrigger>
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
              value={newGroup.name}
              onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              placeholder="f.eks. 7A Matematik"
            />
          </div>
          <div>
            <Label htmlFor="groupDescription">Beskrivelse (valgfri)</Label>
            <Textarea
              id="groupDescription"
              value={newGroup.description}
              onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
              placeholder="Beskrivelse af gruppen..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
              Annuller
            </Button>
            <Button onClick={handleCreateGroup} disabled={!isFormValid()}>
              Opret Gruppe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
