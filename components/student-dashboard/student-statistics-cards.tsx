import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface StudentStatisticsCardsProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  needsHelpTasks: number;
  onFilterChange: (filter: string) => void;
}

export function StudentStatisticsCards({
  totalTasks,
  completedTasks,
  inProgressTasks,
  needsHelpTasks,
  onFilterChange
}: StudentStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('all')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Samlede Opgaver</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Klik for at se alle</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('completed')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Færdige</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Klik for at se færdige</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('in-progress')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">I Gang</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Klik for at se igangværende</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('needs-help')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hjælp Anmodet</CardTitle>
          <HelpCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{needsHelpTasks}</div>
          <p className="text-xs text-muted-foreground mt-1">Klik for at se hjælp anmodninger</p>
        </CardContent>
      </Card>
    </div>
  );
}
