"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/lib/types';
import { StudentTaskInterface } from './student-task-interface';

interface TaskPreviewDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskPreviewDialog({ task, open, onOpenChange }: TaskPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Forhåndsvisning: {task.title}
            </DialogTitle>
            <Badge variant="secondary">Elevvisning</Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6">
          <StudentTaskInterface 
            taskId={task.id} 
            studentId="preview" 
            previewMode={true}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
