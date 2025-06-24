"use client";

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllStudentsByTeacher } from '@/lib/database/users';
import { useAuth } from '@/components/auth-provider';
import { Group, User } from '@/lib/types';

interface TaskAssignmentSelectorProps {
  assignmentType: 'class' | 'individual';
  selectedStudents: string[];
  selectedGroup?: string;
  groups: Group[];
  onAssignmentTypeChange: (type: 'class' | 'individual') => void;
  onStudentSelectionChange: (studentIds: string[]) => void;
  onGroupSelectionChange?: (groupId: string) => void;
}

export function TaskAssignmentSelector({
  assignmentType,
  selectedStudents,
  selectedGroup,
  groups,
  onAssignmentTypeChange,
  onStudentSelectionChange,
  onGroupSelectionChange
}: TaskAssignmentSelectorProps) {
  const { user: currentUser } = useAuth();
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (currentUser && assignmentType === 'individual') {
      loadStudents();
    }
  }, [currentUser, assignmentType]);

  const loadStudents = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingStudents(true);
      const students = await getAllStudentsByTeacher(currentUser.id);
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      setAllStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      onStudentSelectionChange([...selectedStudents, studentId]);
    } else {
      onStudentSelectionChange(selectedStudents.filter(id => id !== studentId));
    }
  };

  // Filter students based on search term
  const filteredStudents = allStudents.filter((student: User) =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // If no current user, show minimal interface
  if (!currentUser) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Tildeling Type</Label>
          <RadioGroup 
            value={assignmentType} 
            onValueChange={(value: 'class' | 'individual') => {
              onAssignmentTypeChange(value);
              if (value === 'class') {
                onStudentSelectionChange([]);
              }
            }}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="class" id="class" />
              <Label htmlFor="class">Tildel til hele klassen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Tildel til individuelle elever</Label>
            </div>
          </RadioGroup>
        </div>
        {assignmentType === 'individual' && (
          <div className="space-y-3">
            <Label>Vælg Elever</Label>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Ingen elever tilgængelige
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assignment Type Selection */}
      <div className="space-y-3">
        <Label>Tildeling Type</Label>
        <RadioGroup 
          value={assignmentType} 
          onValueChange={(value: 'class' | 'individual') => {
            onAssignmentTypeChange(value);
            if (value === 'class') {
              onStudentSelectionChange([]);
            }
          }}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="class" id="class" />
            <Label htmlFor="class">Tildel til hele klassen</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Tildel til individuelle elever</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Group Selection for Class Assignment */}
      {assignmentType === 'class' && (
        <div className="space-y-3">
          <Label>Vælg Hold</Label>
          <Select value={selectedGroup} onValueChange={onGroupSelectionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Vælg et hold" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.students.length} elever)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Individual Student Selection */}
      {assignmentType === 'individual' && (
        <div className="space-y-3">
          <Label>Vælg Elever</Label>
          <Card>
            <CardContent className="pt-4 space-y-3">
              {/* Student Search */}
              <div>
                <Input
                  placeholder="Søg efter elev..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Students List */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Indlæser elever...</span>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentToggle(student.id, !!checked)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="text-xs">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                        {student.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {studentSearchTerm ? 'Ingen elever matcher søgningen' : 'Ingen elever tilgængelige'}
                  </p>
                )}
              </div>
              
              {selectedStudents.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedStudents.length} elev{selectedStudents.length !== 1 ? 'er' : ''} valgt
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
