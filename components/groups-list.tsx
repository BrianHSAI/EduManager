"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { Group } from '@/lib/types';
import { GroupCard } from './group-card';

interface GroupsListProps {
  groups: Group[];
  onSettings: (group: Group) => void;
  onCreateTask: (group: Group) => void;
  onDelete: (group: Group) => void;
  onInviteStudent: (groupId: string, email: string) => Promise<void>;
  onCreateGroup: () => void;
  onRefresh?: () => Promise<void>;
}

export function GroupsList({
  groups,
  onSettings,
  onCreateTask,
  onDelete,
  onInviteStudent,
  onCreateGroup,
  onRefresh
}: GroupsListProps) {
  if (groups.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ingen grupper endnu</h3>
          <p className="text-muted-foreground text-center mb-4">
            Opret din første gruppe for at begynde at administrere dine elever
          </p>
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Opret Din Første Gruppe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onSettings={onSettings}
          onCreateTask={onCreateTask}
          onDelete={onDelete}
          onInviteStudent={onInviteStudent}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
