"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Task, TaskField } from '@/lib/types';
import { TaskFieldBuilder } from './task-field-builder';

interface TaskEditDialogProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function TaskEditDialog({ task, onUpdateTask }: TaskEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    subject: task.subject,
    dueDate: task.dueDate || undefined,
    status: task.status || 'active',
  });
  const [fields, setFields] = useState<TaskField[]>(task.fields);

  // Reset form when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
      subject: task.subject,
      dueDate: task.dueDate || undefined,
      status: task.status || 'active',
    });
    setFields(task.fields);
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Opgavetitel er påkrævet');
      return;
    }

    if (fields.length === 0) {
      alert('Du skal tilføje mindst ét felt til opgaven');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateTask(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        dueDate: formData.dueDate,
        status: formData.status,
        fields: fields,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Der opstod en fejl ved opdatering af opgaven');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Opgavetitel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Indtast opgavetitel"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Fag</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vælg fag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matematik">Matematik</SelectItem>
              <SelectItem value="dansk">Dansk</SelectItem>
              <SelectItem value="engelsk">Engelsk</SelectItem>
              <SelectItem value="historie">Historie</SelectItem>
              <SelectItem value="andet">Andet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivelse</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Beskriv opgaven..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Afleveringsfrist (valgfri)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dueDate ? (
                  format(formData.dueDate, "PPP", { locale: da })
                ) : (
                  <span>Vælg dato</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formData.dueDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, dueDate: undefined }))}
              className="text-muted-foreground"
            >
              Fjern frist
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'active' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vælg status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="completed">Færdig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Opgavefelter</Label>
          <span className="text-sm text-muted-foreground">
            {fields.length} felt{fields.length !== 1 ? 'er' : ''}
          </span>
        </div>
        
        <TaskFieldBuilder
          fields={fields}
          onAddField={(type) => {
            const newField: TaskField = {
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type,
              label: '',
              placeholder: type === 'multiple-choice' || type === 'checkbox' ? undefined : '',
              required: false,
              options: type === 'multiple-choice' ? [''] : undefined,
            };
            setFields(prev => [...prev, newField]);
          }}
          onUpdateField={(id, updates) => {
            setFields(prev => prev.map(field => 
              field.id === id ? { ...field, ...updates } : field
            ));
          }}
          onRemoveField={(id) => {
            setFields(prev => prev.filter(field => field.id !== id));
          }}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Gemmer...' : 'Gem ændringer'}
        </Button>
      </div>
    </form>
  );
}
