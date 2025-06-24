"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { Group } from '@/lib/types';

interface TaskFiltersProps {
  groups: Group[];
  selectedGroupId?: string;
  selectedStatus?: 'all' | 'active' | 'completed';
  onGroupChange: (groupId?: string) => void;
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  groups,
  selectedGroupId,
  selectedStatus = 'all',
  onGroupChange,
  onStatusChange,
  onClearFilters,
}: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedGroupId || selectedStatus !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtrer opgaver
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {(selectedGroupId ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Ryd filtre
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gruppe</Label>
                <Select
                  value={selectedGroupId || 'all'}
                  onValueChange={(value) => onGroupChange(value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle grupper" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle grupper</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value: 'all' | 'active' | 'completed') => onStatusChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle opgaver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle opgaver</SelectItem>
                    <SelectItem value="active">Aktive opgaver</SelectItem>
                    <SelectItem value="completed">Færdige opgaver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
