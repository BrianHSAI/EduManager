import { useState, useEffect } from 'react';
import { Task, TaskSubmission, HelpMessage, TaskFolder, TaskFolderAssignment } from '@/lib/types';
import { getTasksByStudent, getSubmissionsByStudent, getFoldersByStudent, getTaskFolderAssignments } from '@/lib/database';

export function useStudentDashboard(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [folders, setFolders] = useState<TaskFolder[]>([]);
  const [folderAssignments, setFolderAssignments] = useState<TaskFolderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showDetailedView, setShowDetailedView] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<{task: Task, submission: TaskSubmission} | null>(null);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    try {
      const [studentTasks, studentSubmissions, studentFolders, studentFolderAssignments] = await Promise.all([
        getTasksByStudent(userId),
        getSubmissionsByStudent(userId),
        getFoldersByStudent(userId),
        getTaskFolderAssignments(userId)
      ]);
      
      setTasks(studentTasks);
      setSubmissions(studentSubmissions);
      setFolders(studentFolders);
      setFolderAssignments(studentFolderAssignments);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a map of submissions by task ID for easy lookup
  const submissionMap = new Map(
    submissions.map(sub => [sub.taskId, sub])
  );

  // Create a map of folder assignments by task ID for easy lookup
  const folderAssignmentMap = new Map(
    folderAssignments.map(assignment => [assignment.taskId, assignment])
  );

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Exclude tasks that have been marked as completed (inactive) by the teacher
    // unless specifically viewing completed tasks
    if (task.status === 'completed' && statusFilter !== 'completed') {
      return false;
    }
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const submission = submissionMap.get(task.id);
    const status = submission?.status || 'not-started';
    const needsHelp = submission?.needsHelp || false;
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'needs-help') {
      matchesStatus = needsHelp;
    } else if (statusFilter === 'folder' && showDetailedView) {
      // Filter by specific folder
      const assignment = folderAssignmentMap.get(task.id);
      matchesStatus = assignment?.folderId === showDetailedView;
    } else {
      matchesStatus = status === statusFilter;
    }
    
    const matchesSubject = subjectFilter === 'all' || task.subject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Calculate overall statistics - only count active tasks (not completed by teacher)
  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const totalTasks = activeTasks.length;
  const completedTasks = submissions.filter(sub => {
    const task = tasks.find(t => t.id === sub.taskId);
    return sub.status === 'completed' && task?.status !== 'completed';
  }).length;
  const inProgressTasks = submissions.filter(sub => {
    const task = tasks.find(t => t.id === sub.taskId);
    return sub.status === 'in-progress' && task?.status !== 'completed';
  }).length;
  // Only count help requests for ongoing tasks (not completed)
  const needsHelpTasks = submissions.filter(sub => {
    const task = tasks.find(t => t.id === sub.taskId);
    return sub.needsHelp && sub.status !== 'completed' && task?.status !== 'completed';
  }).length;
  const notStartedTasks = Math.max(0, totalTasks - submissions.filter(sub => {
    const task = tasks.find(t => t.id === sub.taskId);
    return task?.status !== 'completed';
  }).length); // Ensure never negative
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate folder statistics
  const getFolderStatistics = (folderId: string) => {
    const folderTasks = tasks.filter(task => {
      const assignment = folderAssignmentMap.get(task.id);
      return assignment?.folderId === folderId && task.status !== 'completed';
    });

    const totalTasks = folderTasks.length;
    const completedTasks = folderTasks.filter(task => {
      const submission = submissionMap.get(task.id);
      return submission?.status === 'completed';
    }).length;
    const inProgressTasks = folderTasks.filter(task => {
      const submission = submissionMap.get(task.id);
      return submission?.status === 'in-progress';
    }).length;
    const remainingTasks = totalTasks - completedTasks;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      remainingTasks
    };
  };

  // Get tasks for a specific folder
  const getTasksForFolder = (folderId: string) => {
    return tasks.filter(task => {
      const assignment = folderAssignmentMap.get(task.id);
      return assignment?.folderId === folderId && task.status !== 'completed';
    });
  };

  const getTaskStatus = (task: Task) => {
    const submission = submissionMap.get(task.id);
    return submission?.status || 'not-started';
  };

  const getTaskProgress = (task: Task) => {
    const submission = submissionMap.get(task.id);
    return submission?.progress || 0;
  };

  const getStatusBadge = (status: string, needsHelp: boolean = false, helpMessages: HelpMessage[] = []) => {
    if (needsHelp) {
      const hasTeacherResponse = helpMessages.some(msg => !msg.isFromStudent);
      return {
        variant: hasTeacherResponse ? 'orange' : 'destructive',
        text: hasTeacherResponse ? 'Hjælp givet' : 'Hjælp anmodet',
        icon: hasTeacherResponse ? 'MessageSquare' : 'HelpCircle'
      };
    }

    switch (status) {
      case 'completed':
        return { variant: 'default', text: 'Færdig', icon: 'CheckCircle' };
      case 'in-progress':
        return { variant: 'secondary', text: 'I gang', icon: 'Clock' };
      case 'not-started':
        return { variant: 'outline', text: 'Ikke startet', icon: 'FileText' };
      default:
        return null;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      matematik: 'bg-blue-100 text-blue-800',
      dansk: 'bg-green-100 text-green-800',
      engelsk: 'bg-purple-100 text-purple-800',
      historie: 'bg-orange-100 text-orange-800',
      andet: 'bg-gray-100 text-gray-800'
    };
    return colors[subject as keyof typeof colors] || colors.andet;
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  };

  return {
    // Data
    tasks,
    submissions,
    folders,
    folderAssignments,
    filteredTasks,
    submissionMap,
    folderAssignmentMap,
    isLoading,
    
    // Statistics
    totalTasks,
    completedTasks,
    inProgressTasks,
    needsHelpTasks,
    overallProgress,
    
    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    subjectFilter,
    setSubjectFilter,
    showDetailedView,
    setShowDetailedView,
    
    // Dialog
    selectedSubmission,
    setSelectedSubmission,
    
    // Helper functions
    getTaskStatus,
    getTaskProgress,
    getStatusBadge,
    getSubjectColor,
    isOverdue,
    getFolderStatistics,
    getTasksForFolder,
    
    // Actions
    loadData
  };
}
