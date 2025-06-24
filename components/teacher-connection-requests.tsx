"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, UserCheck, Users, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getConnectionRequestsByTeacher, respondToConnectionRequest } from '@/lib/database/connection-requests';
import { getGroupsByTeacher, createGroup } from '@/lib/database/groups';
import { ConnectionRequest, Group } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';

export function TeacherConnectionRequests() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [connectionRequests, teacherGroups] = await Promise.all([
        getConnectionRequestsByTeacher(user.id),
        getGroupsByTeacher(user.id)
      ]);
      setRequests(connectionRequests);
      setGroups(teacherGroups);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke indlæse data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = (request: ConnectionRequest) => {
    setSelectedRequest(request);
    setSelectedGroupId('');
    setNewGroupName('');
  };

  const handleDeclineRequest = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const success = await respondToConnectionRequest(requestId, 'declined');
      if (success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
          title: "Anmodning afvist",
          description: "Forbindelsesanmodningen er blevet afvist.",
        });
      } else {
        throw new Error('Failed to decline request');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke afvise anmodningen. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!selectedRequest || !user?.id) return;

    setIsProcessing(true);
    try {
      let targetGroupId = selectedGroupId;

      // Create new group if needed
      if (selectedGroupId === 'new' && newGroupName.trim()) {
        const newGroup = await createGroup(
          {
            name: newGroupName.trim(),
            teacherId: user.id
          },
          [selectedRequest.studentId]
        );
        
        if (!newGroup) {
          throw new Error('Failed to create new group');
        }
        
        targetGroupId = newGroup.id;
      } else if (selectedGroupId && selectedGroupId !== 'new') {
        // Add student to existing group
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('group_members')
          .insert([{
            group_id: selectedGroupId,
            student_id: selectedRequest.studentId
          }]);

        if (error) {
          console.error('Error adding student to group:', error);
          throw new Error('Failed to add student to group');
        }
      }

      // Accept the connection request
      const success = await respondToConnectionRequest(selectedRequest.id, 'accepted');
      if (success) {
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        toast({
          title: "Anmodning accepteret",
          description: `${selectedRequest.studentName} er blevet tilføjet til ${selectedGroupId === 'new' ? 'den nye gruppe' : 'gruppen'}.`,
        });
        
        // Reload groups to show updated data
        const updatedGroups = await getGroupsByTeacher(user.id);
        setGroups(updatedGroups);
      } else {
        throw new Error('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke acceptere anmodningen. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedRequest(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Forbindelsesanmodninger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Indlæser...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Forbindelsesanmodninger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Ingen ventende forbindelsesanmodninger.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Forbindelsesanmodninger ({requests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-lg">
                        {request.studentName}
                      </span>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Afventer</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Klasse: {request.studentClass}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(request.createdAt, { 
                        addSuffix: true, 
                        locale: da 
                      })}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="text-sm">
                    <span className="font-medium">Besked:</span>
                    <p className="mt-1 text-muted-foreground bg-gray-50 p-2 rounded">
                      {request.message}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeclineRequest(request.id)}
                    disabled={isProcessing}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Afvis
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRequest(request)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accepter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accept Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accepter forbindelsesanmodning</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedRequest.studentName}</h4>
                <p className="text-sm text-muted-foreground">
                  Klasse: {selectedRequest.studentClass}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Vælg gruppe</Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg en gruppe eller opret ny" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{group.name} ({group.students.length} elever)</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new">
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Opret ny gruppe</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedGroupId === 'new' && (
                <div className="space-y-2">
                  <Label htmlFor="newGroupName">Navn på ny gruppe</Label>
                  <Input
                    id="newGroupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Indtast gruppenavn"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                  disabled={isProcessing}
                >
                  Annuller
                </Button>
                <Button
                  onClick={handleConfirmAccept}
                  disabled={isProcessing || !selectedGroupId || (selectedGroupId === 'new' && !newGroupName.trim())}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Behandler...
                    </>
                  ) : (
                    'Accepter og tilføj til gruppe'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
