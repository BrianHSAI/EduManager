import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, CheckCircle, Download, FileText, MessageSquare } from 'lucide-react';
import { Task, HelpMessage } from '@/lib/types';
import { StudentHelpDialog } from '../student-help-dialog';
import { StudentHelpOverlay } from '../student-help-overlay';
import { exportToPDF, exportToWord, ExportData } from './export-utils';

interface TaskActionsProps {
  task: Task;
  answers: Record<string, any>;
  studentId: string;
  isSubmitted: boolean;
  needsHelp: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  helpMessages?: HelpMessage[];
  hasUnreadHelp?: boolean;
  onSave: () => void;
  onSubmit: () => void;
  onHelpRequested: (helpData: { urgency: string; category: string; description: string }) => void;
  onRequestMoreHelp?: (message: string) => void;
}

export function TaskActions({
  task,
  answers,
  studentId,
  isSubmitted,
  needsHelp,
  canSubmit,
  isSaving,
  isSubmitting,
  helpMessages = [],
  hasUnreadHelp = false,
  onSave,
  onSubmit,
  onHelpRequested,
  onRequestMoreHelp
}: TaskActionsProps) {
  const { toast } = useToast();
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

  const handleExportPDF = async () => {
    try {
      const exportData: ExportData = {
        task,
        answers,
        studentId,
        submittedAt: isSubmitted ? new Date() : undefined
      };
      
      await exportToPDF(exportData);
      
      toast({
        title: "PDF Eksport",
        description: "PDF eksport er startet. Følg instruktionerne i den nye fane.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke eksportere til PDF. Prøv igen.",
        variant: "destructive",
      });
    }
  };

  const handleExportWord = async () => {
    try {
      const exportData: ExportData = {
        task,
        answers,
        studentId,
        submittedAt: isSubmitted ? new Date() : undefined
      };
      
      await exportToWord(exportData);
      
      toast({
        title: "Word Eksport",
        description: "Word dokumentet er blevet downloadet.",
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke eksportere til Word. Prøv igen.",
        variant: "destructive",
      });
    }
  };

  const handleRequestMoreHelp = async (message: string) => {
    if (onRequestMoreHelp) {
      await onRequestMoreHelp(message);
    }
  };

  // Check if there are teacher responses
  const hasTeacherResponses = helpMessages.some(msg => !msg.isFromStudent);
  const showHelpGivenButton = needsHelp && hasTeacherResponses;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onSave} 
              disabled={isSubmitted || isSaving}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Gemmer...' : 'Gem Arbejde'}
            </Button>
            
            {!isSubmitted && (
              <>
                <Button 
                  onClick={onSubmit} 
                  disabled={!canSubmit || isSubmitting}
                  className="bg-accent hover:bg-accent/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Indsender...' : 'Indsend Opgave'}
                </Button>
                
                {/* Show Help Given button if teacher has responded, otherwise show Help Request */}
                {showHelpGivenButton ? (
                  <Button
                    onClick={() => setShowHelpOverlay(true)}
                    variant="outline"
                    className="relative"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Hjælp Givet
                    {hasUnreadHelp && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                ) : (
                  <StudentHelpDialog
                    taskId={task.id}
                    studentId={studentId}
                    taskTitle={task.title}
                    onHelpRequested={onHelpRequested}
                    disabled={needsHelp && !hasTeacherResponses}
                  />
                )}
              </>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Eksporter PDF
              </Button>
              <Button variant="outline" onClick={handleExportWord}>
                <FileText className="h-4 w-4 mr-2" />
                Eksporter Word
              </Button>
            </div>
          </div>
          
          {!canSubmit && !isSubmitted && (
            <p className="text-sm text-muted-foreground mt-3">
              Udfyld alle påkrævede felter for at kunne indsende opgaven.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Help Overlay */}
      <StudentHelpOverlay
        helpMessages={helpMessages}
        isVisible={showHelpOverlay}
        onClose={() => setShowHelpOverlay(false)}
        onRequestMoreHelp={handleRequestMoreHelp}
        taskTitle={task.title}
      />
    </>
  );
}
