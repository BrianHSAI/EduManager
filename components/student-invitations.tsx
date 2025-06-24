"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Mail, 
  Calendar,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { getInvitationsByStudent, respondToInvitation } from '@/lib/database/groups';
import { useAuth } from '@/components/auth-provider';
import { GroupInvitation } from '@/lib/types';

export function StudentInvitations() {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadInvitations();
    }
  }, [currentUser]);

  const loadInvitations = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const invitationsData = await getInvitationsByStudent(currentUser.id);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    if (respondingTo) return;
    
    try {
      setRespondingTo(invitationId);
      
      const success = await respondToInvitation(invitationId, response);
      
      if (success) {
        // Remove the invitation from the list since it's no longer pending
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Indlæser invitationer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show anything if there are no invitations
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Gruppe Invitationer</span>
        </CardTitle>
        <CardDescription>
          Du har {invitations.length} ventende invitation{invitations.length !== 1 ? 'er' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{invitation.group?.name}</h4>
                {invitation.group?.description && (
                  <p className="text-sm text-muted-foreground">
                    {invitation.group.description}
                  </p>
                )}
              </div>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                Gruppe
              </Badge>
            </div>

            {invitation.invitedByUser && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={invitation.invitedByUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {invitation.invitedByUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Inviteret af {invitation.invitedByUser.name}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Inviteret {invitation.invitedAt.toLocaleDateString('da-DK')} kl. {invitation.invitedAt.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleResponse(invitation.id, 'accepted')}
                disabled={respondingTo === invitation.id}
                className="flex-1"
              >
                {respondingTo === invitation.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResponse(invitation.id, 'declined')}
                disabled={respondingTo === invitation.id}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Afvis
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
