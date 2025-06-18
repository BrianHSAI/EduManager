"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, Send } from 'lucide-react';

interface StudentHelpDialogProps {
  taskId: string;
  studentId: string;
  taskTitle: string;
  onHelpRequested: (helpData: {
    urgency: string;
    category: string;
    description: string;
  }) => void;
  disabled?: boolean;
}

export function StudentHelpDialog({ 
  taskId, 
  studentId, 
  taskTitle, 
  onHelpRequested, 
  disabled = false 
}: StudentHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const [urgency, setUrgency] = useState('medium');
  const [category, setCategory] = useState('understanding');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onHelpRequested({
        urgency,
        category,
        description: description.trim()
      });

      // Reset form
      setUrgency('medium');
      setCategory('understanding');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Error requesting help:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="w-full sm:w-auto"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {disabled ? 'Hjælp Anmodet' : 'Jeg har brug for hjælp'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Anmod om hjælp</DialogTitle>
          <DialogDescription>
            Beskriv hvad du har brug for hjælp til i opgaven "{taskTitle}". 
            Din lærer vil modtage din anmodning og kontakte dig.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Urgency */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hvor hurtigt har du brug for hjælp?</Label>
            <RadioGroup value={urgency} onValueChange={setUrgency}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-sm">
                  Ikke så travlt - jeg kan vente til næste time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-sm">
                  Moderat - gerne inden for i dag
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-sm">
                  Hurtigt - jeg har brug for hjælp nu
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hvad har du brug for hjælp til?</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="understanding" id="understanding" />
                <Label htmlFor="understanding" className="text-sm">
                  Jeg forstår ikke opgaven
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical" className="text-sm">
                  Tekniske problemer (computer, program, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="content" id="content" />
                <Label htmlFor="content" className="text-sm">
                  Jeg ved ikke hvordan jeg skal svare
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="text-sm">
                  Andet
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Beskriv dit problem *
            </Label>
            <Textarea
              id="description"
              placeholder="Forklar hvad du har brug for hjælp til. Jo mere detaljeret, jo bedre kan din lærer hjælpe dig..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {description.length}/500 tegn
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Annuller
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sender...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Anmodning
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
