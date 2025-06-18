"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  Clock, 
  MessageSquare,
  Eye,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';
import { 
  mockSubmissions,
  getUserById,
  getTaskById,
  mockTasks
} from '@/lib/mock-data';

export function HelpRequests() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [helpResponse, setHelpResponse] = useState('');

  const helpRequests = mockSubmissions.filter(s => s.needsHelp);

  const handleProvideHelp = (submissionId: string) => {
    console.log('Providing help for submission:', submissionId, 'Response:', helpResponse);
    setSelectedSubmission(null);
    setHelpResponse('');
  };

  const markAsResolved = (submissionId: string) => {
    console.log('Marking help request as resolved:', submissionId);
  };

  const viewStudentWork = (submissionId: string) => {
    console.log('Viewing student work:', submissionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hjælp Anmodninger</h1>
          <p className="text-muted-foreground mt-2">
            Elever der har brug for din hjælp
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-3 py-1">
          {helpRequests.length} aktive anmodninger
        </Badge>
      </div>

      {helpRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ingen hjælp anmodninger</h3>
            <p className="text-muted-foreground text-center">
              Alle dine elever klarer sig godt! Der er ingen aktive hjælp anmodninger.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((submission) => {
            const student = getUserById(submission.studentId);
            const task = getTaskById(submission.taskId);
            
            if (!student || !task) return null;

            const timeAgo = new Date().getTime() - new Date(submission.lastSaved).getTime();
            const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
            const minutesAgo = Math.floor(timeAgo / (1000 * 60));

            return (
              <Card key={submission.id} className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                          <HelpCircle className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{task.title}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">
                        Har brug for hjælp
                      </Badge>
                      <Badge variant="outline">
                        {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Anmodet for {hoursAgo > 0 ? `${hoursAgo} timer` : `${minutesAgo} minutter`} siden
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Fremskridt: {submission.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Show current answers */}
                  <div className="bg-background rounded-lg p-4 border">
                    <h4 className="font-medium mb-3">Elevens nuværende arbejde:</h4>
                    <div className="space-y-3">
                      {task.fields.map((field) => {
                        const answer = submission.answers[field.id];
                        return (
                          <div key={field.id} className="space-y-1">
                            <Label className="text-sm font-medium">{field.label}</Label>
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {answer || <em>Ikke besvaret</em>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewStudentWork(submission.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Se Arbejde Live
                    </Button>
                    
                    <Dialog open={selectedSubmission === submission.id} onOpenChange={(open) => {
                      if (open) setSelectedSubmission(submission.id);
                      else setSelectedSubmission(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Giv Hjælp
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Hjælp {student.name}</DialogTitle>
                          <DialogDescription>
                            Skriv en hjælpsom besked til eleven om opgaven "{task.title}"
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
                            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                              Annuller
                            </Button>
                            <Button 
                              onClick={() => handleProvideHelp(submission.id)}
                              disabled={!helpResponse.trim()}
                            >
                              Send Hjælp
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsResolved(submission.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marker som Løst
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Anmodninger</CardTitle>
            <HelpCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{helpRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Elever der venter på hjælp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gennemsnitlig Ventetid</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {helpRequests.length > 0 ? '2.5t' : '0t'}
            </div>
            <p className="text-xs text-muted-foreground">
              Siden anmodning blev sendt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mest Hjælp Behov</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Matematik</div>
            <p className="text-xs text-muted-foreground">
              Fag med flest anmodninger
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
