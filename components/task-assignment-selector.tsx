"use client";

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllStudentsByTeacher, getCurrentUser } from '@/lib/mock-data';

interface TaskAssignmentSelectorProps {
  assignmentType: 'class' | 'individual';
  selectedStudents: string[];
  onAssignmentTypeChange: (type: 'class' | 'individual') => void;
  onStudentSelectionChange: (studentIds: string[]) => void;
}

export function TaskAssignmentSelector({
  assignmentType,
  selectedStudents,
  onAssignmentTypeChange,
  onStudentSelectionChange
}: TaskAssignmentSelectorProps) {
  const currentUser = getCurrentUser();

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      onStudentSelectionChange([...selectedStudents, studentId]);
    } else {
      onStudentSelectionChange(selectedStudents.filter(id => id !== studentId));
    }
  };

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

      {/* Individual Student Selection */}
      {assignmentType === 'individual' && (
        <div className="space-y-3">
          <Label>Vælg Elever</Label>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {getAllStudentsByTeacher(currentUser.id).map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => handleStudentToggle(student.id, !!checked)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                      {student.name}
                    </Label>
                  </div>
                ))}
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
