"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Mail, 
  Calendar,
  Settings,
  Trash2,
  UserPlus
} from 'lucide-react';
import { getCurrentUser, getGroupsByTeacher, mockUsers } from '@/lib/mock-data';

export function GroupsManagement() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  const currentUser = getCurrentUser();
  const groups = getGroupsByTeacher(currentUser.id);

  const handleCreateGroup = () => {
    // In a real app, this would make an API call
    console.log('Creating group:', { name: newGroupName, description: newGroupDescription });
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  const handleAddStudent = () => {
    // In a real app, this would make an API call
    console.log('Adding student:', studentEmail, 'to group:', selectedGroup);
    setShowAddStudent(false);
    setStudentEmail('');
    setSelectedGroup(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupper</h1>
          <p className="text-muted-foreground mt-2">
            Administrer dine klasser og elever
          </p>
        </div>
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Opret Gruppe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Opret Ny Gruppe</DialogTitle>
              <DialogDescription>
                Opret en ny gruppe til dine elever
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Gruppe Navn</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="f.eks. 7A Matematik"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Beskrivelse (valgfri)</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Beskrivelse af gruppen..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Annuller
                </Button>
                <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                  Opret Gruppe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Oprettet {group.createdAt.toLocaleDateString('da-DK')}
                  </span>
                </div>
                <Badge variant="secondary">
                  {group.students.length} elever
                </Badge>
              </div>

              {/* Students List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Elever</h4>
                  <Dialog open={showAddStudent && selectedGroup === group.id} onOpenChange={(open) => {
                    setShowAddStudent(open);
                    if (open) setSelectedGroup(group.id);
                    else setSelectedGroup(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tilføj Elev</DialogTitle>
                        <DialogDescription>
                          Tilføj en elev til gruppen "{group.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="studentEmail">Elevens Email</Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="elev@skole.dk"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                            Annuller
                          </Button>
                          <Button onClick={handleAddStudent} disabled={!studentEmail.trim()}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {group.students.slice(0, 4).map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{student.name}</span>
                    </div>
                  ))}
                  {group.students.length > 4 && (
                    <div className="text-xs text-muted-foreground">
                      +{group.students.length - 4} flere elever
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Se Detaljer
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {groups.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Ingen grupper endnu</h3>
              <p className="text-muted-foreground text-center mb-4">
                Opret din første gruppe for at begynde at administrere dine elever
              </p>
              <Button onClick={() => setShowCreateGroup(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Opret Din Første Gruppe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
