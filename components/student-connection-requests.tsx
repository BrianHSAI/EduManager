"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, User, Mail } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getConnectionRequestsByStudent, deleteConnectionRequest } from '@/lib/database/connection-requests';
import { ConnectionRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';

export function StudentConnectionRequests() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadConnectionRequests();
    }
  }, [user]);

  const loadConnectionRequests = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const connectionRequests = await getConnectionRequestsByStudent(user.id);
      setRequests(connectionRequests);
    } catch (error) {
      console.error('Error loading connection requests:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke indlæse forbindelsesanmodninger.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const success = await deleteConnectionRequest(requestId);
      if (success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
          title: "Anmodning slettet",
          description: "Forbindelsesanmodningen er blevet slettet.",
        });
      } else {
        throw new Error('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting connection request:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke slette anmodningen. Prøv igen senere.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Afventer</span>
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            <span>Accepteret</span>
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Afvist</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Mine forbindelsesanmodninger</span>
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
            <User className="h-5 w-5" />
            <span>Mine forbindelsesanmodninger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Du har ingen forbindelsesanmodninger endnu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Mine forbindelsesanmodninger ({requests.length})</span>
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
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.teacher?.name || 'Ukendt lærer'}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.teacher?.email}
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

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Navn:</span> {request.studentName}
                </div>
                <div>
                  <span className="font-medium">Klasse:</span> {request.studentClass}
                </div>
              </div>

              {request.message && (
                <div className="text-sm">
                  <span className="font-medium">Besked:</span>
                  <p className="mt-1 text-muted-foreground">{request.message}</p>
                </div>
              )}

              {request.status === 'accepted' && request.respondedAt && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Accepteret {formatDistanceToNow(request.respondedAt, { 
                    addSuffix: true, 
                    locale: da 
                  })}
                </div>
              )}

              {request.status === 'declined' && request.respondedAt && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Afvist {formatDistanceToNow(request.respondedAt, { 
                    addSuffix: true, 
                    locale: da 
                  })}
                </div>
              )}

              {request.status !== 'pending' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRequest(request.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Slet
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
