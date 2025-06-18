"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  HelpCircle
} from 'lucide-react';
import { 
  getCurrentUser, 
  getGroupsByTeacher, 
  mockTasks, 
  mockSubmissions,
  getUserById 
} from '@/lib/mock-data';
import { TaskField } from '@/lib/types';
import { TaskCreationDialog } from './task-creation-dialog';
import { GroupCreationDialog } from './group-creation-dialog';

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
}

export function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const currentUser = getCurrentUser();
  const groups = getGroupsByTeacher(currentUser.id);
  const totalStudents = groups.reduce((acc, group) => acc + group.students.length, 0);
  const totalTasks = mockTasks.length;
  
  // Calculate statistics
  const completedSubmissions = mockSubmissions.filter(s => s.status === 'completed').length;
  const helpRequests = mockSubmissions.filter(s => s.needsHelp).length;
  const inProgressSubmissions = mockSubmissions.filter(s => s.status === 'in-progress').length;

  const handleCreateTask = (taskData: any, fields: TaskField[], selectedStudents: string[]) => {
    console.log('Creating task from overview:', { taskData, fields, selectedStudents });
    // In a real app, this would make an API call to create the task
  };

  const handleCreateGroup = (groupData: any) => {
    console.log('Creating group from overview:', groupData);
    // In a real app, this would make an API call to create the group
  };

  const stats = [
    {
      title: 'Aktive Grupper',
      value: 2,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      navigateTo: 'groups'
    },
    {
      title: 'Samlede Elever',
      value: 7,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      navigateTo: 'groups' // Students are managed within groups
    },
    {
      title: 'Aktive Opgaver',
      value: 3,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      navigateTo: 'tasks'
    },
    {
      title: 'Hjælp Anmodninger',
      value: 1,
      icon: HelpCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      navigateTo: 'help-requests'
    }
  ];

  // Recent activity data matching the image
  const recentActivity = [
    {
      id: 'SL',
      name: 'Sofia Larsen',
      subject: 'Grundlæggende Addition',
      status: 'I gang',
      statusColor: 'bg-blue-500'
    },
    {
      id: 'MA',
      name: 'Mikkel Andersen',
      subject: 'Grundlæggende Addition',
      status: 'Hjælp',
      statusColor: 'bg-red-500'
    },
    {
      id: 'EN',
      name: 'Emma Nielsen',
      subject: 'Kreativ Skrivning',
      status: 'I gang',
      statusColor: 'bg-blue-500'
    },
    {
      id: 'EN',
      name: 'Emma Nielsen',
      subject: 'Grundlæggende Addition',
      status: 'Færdig',
      statusColor: 'bg-blue-500'
    }
  ];

  // Task status data matching the image
  const taskStatus = [
    {
      name: 'Grundlæggende Addition',
      completed: 1,
      total: 4,
      progress: 25
    },
    {
      name: 'Kreativ Skrivning',
      completed: 0,
      total: 3,
      progress: 0
    },
    {
      name: 'Individuel Matematik Øvelse',
      completed: 0,
      total: 2,
      progress: 0
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Velkommen tilbage, Lars Hansen</h1>
          <p className="text-gray-600 mt-1">
            Her er et overblik over dine klasser og opgaver
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Opret Gruppe
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Opret Opgave
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => onNavigate(stat.navigateTo)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Seneste Aktivitet</CardTitle>
            <CardDescription className="text-gray-600">
              Nylige elevbesvarelser og opdateringer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">{activity.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.subject}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${activity.statusColor} text-white border-0`}
                  >
                    {activity.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Status Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Opgave Status</CardTitle>
            <CardDescription className="text-gray-600">
              Overblik over alle opgavebesvarelser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {taskStatus.map((task, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.name}</p>
                    <p className="text-xs text-gray-500">
                      {task.completed} af {task.total} elever færdige
                    </p>
                  </div>
                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                    {task.progress}%
                  </Badge>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Help Requests */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>Elever der har brug for hjælp</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            1 elever har anmodet om hjælp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">MA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Mikkel Andersen</p>
                <p className="text-xs text-gray-500">Grundlæggende Addition</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Hjælp Elev
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
