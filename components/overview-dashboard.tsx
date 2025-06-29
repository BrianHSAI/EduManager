"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, HelpCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
}

export function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const { user: currentUser } = useAuth();
  const [hasActiveHelpRequests, setHasActiveHelpRequests] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      checkForActiveHelpRequests();
    }
  }, [currentUser]);

  const checkForActiveHelpRequests = async () => {
    if (!currentUser) return;

    try {
      // Check for pending help requests for this teacher's tasks
      const { data: helpRequests, error } = await supabase
        .from('help_messages')
        .select(`
          id,
          tasks!inner (
            teacher_id
          )
        `)
        .eq('tasks.teacher_id', currentUser.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error checking help requests:', error);
      } else {
        setHasActiveHelpRequests((helpRequests || []).length > 0);
      }
    } catch (error) {
      console.error('Error checking help requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          Velkommen, {currentUser.name}
        </h1>
        <p className="text-xl text-gray-600">
          Hvad vil du gerne gøre i dag?
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Create Task Button */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Opret opgave</h3>
              <p className="text-muted-foreground text-sm">
                Lav en ny opgave til dine elever
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => onNavigate('tasks')}
            >
              Opret opgave
            </Button>
          </CardContent>
        </Card>

        {/* Create Group Button */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Opret gruppe</h3>
              <p className="text-muted-foreground text-sm">
                Organiser dine elever i grupper
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => onNavigate('groups')}
            >
              Opret gruppe
            </Button>
          </CardContent>
        </Card>

        {/* Help Requests Button */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              hasActiveHelpRequests 
                ? 'bg-red-100 group-hover:bg-red-200' 
                : 'bg-purple-100 group-hover:bg-purple-200'
            }`}>
              <HelpCircle className={`h-8 w-8 ${
                hasActiveHelpRequests ? 'text-red-600' : 'text-purple-600'
              }`} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Hjælpeanmodninger</h3>
              <p className="text-muted-foreground text-sm">
                {hasActiveHelpRequests 
                  ? 'Du har aktive hjælpeanmodninger!' 
                  : 'Se hjælpeanmodninger fra elever'
                }
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              variant={hasActiveHelpRequests ? "destructive" : "default"}
              onClick={() => onNavigate('help-requests')}
            >
              {hasActiveHelpRequests ? 'Se anmodninger!' : 'Hjælpeanmodninger'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Du kan altid navigere mellem sektioner ved hjælp af menuen øverst</p>
      </div>
    </div>
  );
}
