import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface StudentTaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  subjectFilter: string;
  setSubjectFilter: (subject: string) => void;
}

export function StudentTaskFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter
}: StudentTaskFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtrer Opgaver</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søg opgaver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer efter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle status</SelectItem>
              <SelectItem value="not-started">Ikke startet</SelectItem>
              <SelectItem value="in-progress">I gang</SelectItem>
              <SelectItem value="completed">Færdig</SelectItem>
              <SelectItem value="needs-help">Hjælp anmodet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer efter fag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle fag</SelectItem>
              <SelectItem value="matematik">Matematik</SelectItem>
              <SelectItem value="dansk">Dansk</SelectItem>
              <SelectItem value="engelsk">Engelsk</SelectItem>
              <SelectItem value="historie">Historie</SelectItem>
              <SelectItem value="andet">Andet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
