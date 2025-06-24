"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { Group, User } from '@/lib/types';
import { StudentInvitationDialog } from './student-invitation-dialog';

interface GroupSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onUpdateGroup: (groupId: string, updates: { name: string; description?: string }) => Promise<void>;
  onInviteStudent: (groupId: string, email: string) => Promise<void>;
  onRemoveStudent: (groupId: string, studentId: string) => Promise<void>;
}

export function GroupSettingsDialog({
  isOpen,
  onOpenChange,
  group,
  onUpdateGroup,
  onInviteStudent,
  onRemoveStudent
}: GroupSettingsDialogProps) {
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Update form when group changes
  useEffect(() => {
    if (group) {
      setEditGroupName(group.name);
      setEditGroupDescription(group.description || '');
    }
  }, [group]);

  const handleUpdateGroup = async () => {
    if (!group || !editGroupName.trim() || isUpdating) return;
    
    try {
      setIsUpdating(true);
      await onUpdateGroup(group.id, {
        name: editGroupName.trim(),
        description: editGroupDescription.trim() || undefined
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInviteStudent = async (email: string) => {
    if (!group) return;
    await onInviteStudent(group.id, email);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!group) return;
    await onRemoveStudent(group.id, studentId);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowInviteDialog(false);
    }
    onOpenChange(open);
  };

  if (!group) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gruppe Indstillinger</DialogTitle>
            <DialogDescription>
              Rediger gruppe "{group.name}" og administrer elever
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Group Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Gruppe Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="editGroupName">Gruppe Navn</Label>
                  <Input
                    id="editGroupName"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder="f.eks. 7A Matematik"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label htmlFor="editGroupDescription">Beskrivelse (valgfri)</Label>
                  <Textarea
                    id="editGroupDescription"
                    value={editGroupDescription}
                    onChange={(e) => setEditGroupDescription(e.target.value)}
                    placeholder="Beskrivelse af gruppen..."
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Elever ({group.students.length})</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter Elev
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {group.students.length > 0 ? (
                  group.students.map((student: User) => (
                    <div key={student.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="text-xs">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>Ingen elever i denne gruppe endnu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Annuller
              </Button>
              <Button 
                onClick={handleUpdateGroup} 
                disabled={!editGroupName.trim() || isUpdating}
              >
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gem Ændringer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Invitation Dialog */}
      <StudentInvitationDialog
        isOpen={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        groupName={group.name}
        onInviteStudent={handleInviteStudent}
      />
    </>
  );
}
