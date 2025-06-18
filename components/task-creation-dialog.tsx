"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { TaskField, Group } from '@/lib/types';
import { TaskFieldBuilder } from './task-field-builder';
import { TaskAssignmentSelector } from './task-assignment-selector';

interface NewTaskData {
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  assignmentType: 'class' | 'individual';
}

interface TaskCreationDialogProps {
  groups: Group[];
  onCreateTask: (taskData: NewTaskData, fields: TaskField[], selectedStudents: string[]) => void;
}

export function TaskCreationDialog({ groups, onCreateTask }: TaskCreationDialogProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: '',
    description: '',
    subject: '',
    groupId: '',
    dueDate: '',
    assignmentType: 'class'
  });
  const [taskFields, setTaskFields] = useState<TaskField[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const addField = (type: TaskField['type']) => {
    const newField: TaskField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      required: false,
      placeholder: type === 'multiple-choice' ? undefined : '',
      options: type === 'multiple-choice' ? [''] : undefined
    };
    setTaskFields([...taskFields, newField]);
  };

  const updateField = (id: string, updates: Partial<TaskField>) => {
    setTaskFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    setTaskFields(fields => fields.filter(field => field.id !== id));
  };

  const handleCreateTask = () => {
    onCreateTask(newTask, taskFields, selectedStudents);
    setShowCreateTask(false);
    setNewTask({ title: '', description: '', subject: '', groupId: '', dueDate: '', assignmentType: 'class' });
    setTaskFields([]);
    setSelectedStudents([]);
  };

  const isFormValid = () => {
    const basicValid = newTask.title.trim() && newTask.subject && taskFields.length > 0;
    
    if (newTask.assignmentType === 'class') {
      return basicValid && newTask.groupId;
    } else {
      return basicValid && selectedStudents.length > 0;
    }
  };

  return (
    <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Opret Opgave
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opret Ny Opgave</DialogTitle>
          <DialogDescription>
            Opret en ny opgave med tilpassede felter til dine elever
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Grundlæggende Info</TabsTrigger>
            <TabsTrigger value="fields">Opgave Felter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskTitle">Opgave Titel</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="f.eks. Grundlæggende Addition"
                />
              </div>
              <div>
                <Label htmlFor="taskSubject">Fag</Label>
                <Select value={newTask.subject} onValueChange={(value) => setNewTask({...newTask, subject: value})}>
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
            
            <div>
              <Label htmlFor="taskDescription">Beskrivelse</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Beskriv opgaven..."
              />
            </div>

            <TaskAssignmentSelector
              assignmentType={newTask.assignmentType}
              selectedStudents={selectedStudents}
              onAssignmentTypeChange={(type) => setNewTask({...newTask, assignmentType: type})}
              onStudentSelectionChange={setSelectedStudents}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {newTask.assignmentType === 'class' && (
                <div>
                  <Label htmlFor="taskGroup">Gruppe</Label>
                  <Select value={newTask.groupId} onValueChange={(value) => setNewTask({...newTask, groupId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg gruppe" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="taskDueDate">Afleveringsfrist (valgfri)</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fields" className="space-y-4">
            <TaskFieldBuilder
              fields={taskFields}
              onAddField={addField}
              onUpdateField={updateField}
              onRemoveField={removeField}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowCreateTask(false)}>
            Annuller
          </Button>
          <Button 
            onClick={handleCreateTask} 
            disabled={!isFormValid()}
          >
            Opret Opgave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
