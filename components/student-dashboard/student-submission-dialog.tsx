import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, TaskSubmission } from '@/lib/types';

interface StudentSubmissionDialogProps {
  selectedSubmission: {task: Task, submission: TaskSubmission} | null;
  onClose: () => void;
}

export function StudentSubmissionDialog({
  selectedSubmission,
  onClose
}: StudentSubmissionDialogProps) {
  return (
    <Dialog open={!!selectedSubmission} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Besvarelse: {selectedSubmission?.task.title}</DialogTitle>
          <DialogDescription>
            Din indsendte besvarelse for denne opgave
          </DialogDescription>
        </DialogHeader>
        
        {selectedSubmission && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Opgave:</Label>
                    <p className="text-muted-foreground">{selectedSubmission.task.title}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Fag:</Label>
                    <p className="text-muted-foreground capitalize">{selectedSubmission.task.subject}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Indsendt:</Label>
                    <p className="text-muted-foreground">
                      {selectedSubmission.submission.submittedAt?.toLocaleString('da-DK') || 'Ikke indsendt'}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Fremskridt:</Label>
                    <p className="text-muted-foreground">{selectedSubmission.submission.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dine Svar</h3>
                {selectedSubmission.task.fields.map((field) => {
                  const answer = selectedSubmission.submission.answers[field.id];
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-sm font-medium">{field.label}</Label>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                      <div className="bg-background border rounded-md p-3">
                        {field.type === 'multiple-choice' ? (
                          <p className="text-sm">{answer || <em className="text-muted-foreground">Ikke besvaret</em>}</p>
                        ) : field.type === 'checkbox' ? (
                          <p className="text-sm">{answer ? 'Ja' : 'Nej'}</p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">
                            {answer || <em className="text-muted-foreground">Ikke besvaret</em>}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Help Messages if any */}
              {selectedSubmission.submission.helpMessages && selectedSubmission.submission.helpMessages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hjælp Beskeder</h3>
                  <div className="space-y-3">
                    {selectedSubmission.submission.helpMessages
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg ${
                          message.isFromStudent 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'bg-green-50 border-l-4 border-green-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={message.isFromStudent ? "default" : "secondary"}>
                              {message.isFromStudent ? 'Du' : 'Lærer'}
                            </Badge>
                            {message.isFromStudent && (
                              <Badge variant="outline" className="text-xs">
                                {message.urgency === 'high' ? 'Hurtigt' : 
                                 message.urgency === 'medium' ? 'Moderat' : 'Ikke travlt'}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('da-DK')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Luk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
