import { User, Group, Task, TaskSubmission } from './types';

// Empty data arrays - start fresh
export const mockUsers: User[] = [];
export const mockGroups: Group[] = [];
export const mockTasks: Task[] = [];
export const mockSubmissions: TaskSubmission[] = [];

// Helper functions that work with empty data
export const getCurrentUser = (): User | null => {
  // Return null when no users exist - will need to be handled in components
  return mockUsers.length > 0 ? mockUsers[0] : null;
};

export const getGroupsByTeacher = (teacherId: string): Group[] => {
  return mockGroups.filter(group => group.teacherId === teacherId);
};

export const getTasksByGroup = (groupId: string): Task[] => {
  return mockTasks.filter(task => task.groupId === groupId);
};

export const getSubmissionsByTask = (taskId: string): TaskSubmission[] => {
  return mockSubmissions.filter(submission => submission.taskId === taskId);
};

export const getSubmissionsByStudent = (studentId: string): TaskSubmission[] => {
  return mockSubmissions.filter(submission => submission.studentId === studentId);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getTaskById = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

export const getSubmission = (taskId: string, studentId: string): TaskSubmission | undefined => {
  return mockSubmissions.find(s => s.taskId === taskId && s.studentId === studentId);
};

export const getAllStudentsByTeacher = (teacherId: string): User[] => {
  const teacherGroups = getGroupsByTeacher(teacherId);
  const allStudents = teacherGroups.flatMap(group => group.students);
  // Remove duplicates based on student ID
  const uniqueStudents = allStudents.filter((student, index, self) => 
    index === self.findIndex(s => s.id === student.id)
  );
  return uniqueStudents;
};

// Utility functions for adding data (to be used by components)
export const addUser = (user: User): void => {
  mockUsers.push(user);
};

export const addGroup = (group: Group): void => {
  mockGroups.push(group);
};

export const addTask = (task: Task): void => {
  mockTasks.push(task);
};

export const addSubmission = (submission: TaskSubmission): void => {
  mockSubmissions.push(submission);
};

export const updateSubmission = (taskId: string, studentId: string, updates: Partial<TaskSubmission>): void => {
  const index = mockSubmissions.findIndex(s => s.taskId === taskId && s.studentId === studentId);
  if (index !== -1) {
    mockSubmissions[index] = { ...mockSubmissions[index], ...updates };
  }
};
