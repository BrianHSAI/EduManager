import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NoPasteInput } from '@/components/ui/no-paste-input';
import { NoPasteTextarea } from '@/components/ui/no-paste-textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle } from 'lucide-react';
import { TaskField } from '@/lib/types';
import { getTextProgress, TextProgress } from './task-progress-tracker';

interface TaskFieldRendererProps {
  field: TaskField;
  value: any;
  index: number;
  isDisabled: boolean;
  onValueChange: (fieldId: string, value: any) => void;
}

export function TaskFieldRenderer({ 
  field, 
  value, 
  index, 
  isDisabled, 
  onValueChange 
}: TaskFieldRendererProps) {
  const textProgress = (field.type === 'text' || field.type === 'textarea') 
    ? getTextProgress(field, value || '') 
    : null;

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <NoPasteInput
              value={value || ''}
              onChange={(e) => onValueChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isDisabled}
            />
            {textProgress && <TextProgressDisplay progress={textProgress} />}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            <NoPasteTextarea
              value={value || ''}
              onChange={(e) => onValueChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              disabled={isDisabled}
            />
            {textProgress && <TextProgressDisplay progress={textProgress} />}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
          />
        );

      case 'multiple-choice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(newValue) => onValueChange(field.id, newValue)}
            disabled={isDisabled}
          >
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${optionIndex}`} />
                <Label htmlFor={`${field.id}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => onValueChange(field.id, checked)}
              disabled={isDisabled}
            />
            <Label>Ja</Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{index + 1}</Badge>
          <Label className="text-base font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        {renderFieldInput()}
      </CardContent>
    </Card>
  );
}

interface TextProgressDisplayProps {
  progress: TextProgress;
}

function TextProgressDisplay({ progress }: TextProgressDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Fremskridt: {progress.current} / {progress.target} {progress.type === 'characters' ? 'tegn' : 'ord'}
        </span>
        <div className="flex items-center space-x-2">
          {progress.isComplete && (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mål nået
            </Badge>
          )}
          <span className="text-xs font-medium">
            {Math.round(progress.progress)}%
          </span>
        </div>
      </div>
      <Progress 
        value={progress.progress} 
        className={`h-2 ${progress.isComplete ? 'bg-green-100' : ''}`}
      />
    </div>
  );
}
