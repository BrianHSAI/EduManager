"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Save, 
  HelpCircle, 
  Download, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Task, TaskSubmission, TaskField } from '@/lib/types';
import { getTaskById, getSubmission } from '@/lib/mock-data';
import { StudentHelpDialog } from './student-help-dialog';

interface StudentTaskInterfaceProps {
  taskId: string;
  studentId: string;
  previewMode?: boolean;
}

export function StudentTaskInterface({ taskId, studentId, previewMode = false }: StudentTaskInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [needsHelp, setNeedsHelp] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const task = getTaskById(taskId);
  const existingSubmission = getSubmission(taskId, studentId);

  useEffect(() => {
    if (existingSubmission) {
      setAnswers(existingSubmission.answers);
      setNeedsHelp(existingSubmission.needsHelp);
      setLastSaved(existingSubmission.lastSaved);
      setIsSubmitted(existingSubmission.status === 'completed');
    }
  }, [existingSubmission]);

  if (!task) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Opgave ikke fundet</h3>
            <p className="text-muted-foreground">
              Den anmodede opgave kunne ikke findes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateProgress = () => {
    const totalFields = task.fields.length;
    const answeredFields = task.fields.filter(field => {
      const answer = answers[field.id];
      return answer !== undefined && answer !== '' && answer !== null;
    }).length;
    
    return totalFields > 0 ? (answeredFields / totalFields) * 100 : 0;
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving work:', { taskId, studentId, answers, needsHelp });
    setLastSaved(new Date());
  };

  const handleSubmit = () => {
    console.log('Submitting task:', { taskId, studentId, answers });
    setIsSubmitted(true);
  };

  const handleHelpRequested = (helpData: {
    urgency: string;
    category: string;
    description: string;
  }) => {
    setNeedsHelp(true);
    console.log('Student needs help:', { 
      taskId, 
      studentId, 
      ...helpData 
    });
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF:', { taskId, studentId, answers });
  };

  const handleExportWord = () => {
    console.log('Exporting to Word:', { taskId, studentId, answers });
  };

  const getTextProgress = (field: TaskField, value: string) => {
    if (!field.completionCriteria) return null;
    
    const { type, target } = field.completionCriteria;
    let current = 0;
    
    if (type === 'characters') {
      current = value.length;
    } else if (type === 'words') {
      current = value.trim() ? value.trim().split(/\s+/).length : 0;
    }
    
    const progress = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;
    
    return { current, target, progress, isComplete, type };
  };

  const renderField = (field: TaskField) => {
    const value = answers[field.id] || '';
    const textProgress = (field.type === 'text' || field.type === 'textarea') ? getTextProgress(field, value) : null;

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Input
              value={value}
              onChange={(e) => handleAnswerChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isSubmitted || previewMode}
            />
            {textProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Fremskridt: {textProgress.current} / {textProgress.target} {textProgress.type === 'characters' ? 'tegn' : 'ord'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {textProgress.isComplete && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mål nået
                      </Badge>
                    )}
                    <span className="text-xs font-medium">
                      {Math.round(textProgress.progress)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={textProgress.progress} 
                  className={`h-2 ${textProgress.isComplete ? 'bg-green-100' : ''}`}
                />
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            <Textarea
              value={value}
              onChange={(e) => handleAnswerChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              disabled={isSubmitted || previewMode}
            />
            {textProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Fremskridt: {textProgress.current} / {textProgress.target} {textProgress.type === 'characters' ? 'tegn' : 'ord'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {textProgress.isComplete && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mål nået
                      </Badge>
                    )}
                    <span className="text-xs font-medium">
                      {Math.round(textProgress.progress)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={textProgress.progress} 
                  className={`h-2 ${textProgress.isComplete ? 'bg-green-100' : ''}`}
                />
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isSubmitted || previewMode}
          />
        );

      case 'multiple-choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => handleAnswerChange(field.id, newValue)}
            disabled={isSubmitted || previewMode}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleAnswerChange(field.id, checked)}
              disabled={isSubmitted || previewMode}
            />
            <Label>Ja</Label>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = calculateProgress();
  const canSubmit = task.fields.every(field => 
    !field.required || (answers[field.id] !== undefined && answers[field.id] !== '')
  );

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Task Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription className="mt-2">{task.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}
              </Badge>
              {isSubmitted && (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Indsendt
                </Badge>
              )}
              {needsHelp && (
                <Badge variant="destructive">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Hjælp anmodet
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fremskridt</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% færdig
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {task.dueDate && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Afleveringsfrist: {task.dueDate.toLocaleDateString('da-DK')}</span>
              </div>
            )}
            
            {lastSaved && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Save className="h-4 w-4" />
                <span>Sidst gemt: {lastSaved.toLocaleString('da-DK')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Fields */}
      <div className="space-y-6">
        {task.fields.map((field, index) => (
          <Card key={field.id}>
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
              {renderField(field)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      {!previewMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={isSubmitted}>
                <Save className="h-4 w-4 mr-2" />
                Gem Arbejde
              </Button>
              
              {!isSubmitted && (
                <>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!canSubmit}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Indsend Opgave
                  </Button>
                  
                  <StudentHelpDialog
                    taskId={taskId}
                    studentId={studentId}
                    taskTitle={task.title}
                    onHelpRequested={handleHelpRequested}
                    disabled={needsHelp}
                  />
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
            
            {!canSubmit && (
              <p className="text-sm text-muted-foreground mt-3">
                Udfyld alle påkrævede felter for at kunne indsende opgaven.
              </p>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}
