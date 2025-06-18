export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  students: User[];
  createdAt: Date;
}

export interface TaskField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'multiple-choice' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For multiple-choice
  completionCriteria?: {
    type: 'characters' | 'words';
    target: number;
  }; // For text and textarea fields
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: 'matematik' | 'dansk' | 'engelsk' | 'historie' | 'andet';
  fields: TaskField[];
  groupId?: string; // Optional - can be null if assigning to individual students
  teacherId: string;
  assignedStudents: string[]; // Individual student IDs
  assignmentType: 'class' | 'individual'; // New field to track assignment type
  dueDate?: Date;
  createdAt: Date;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  answers: Record<string, any>;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-help';
  needsHelp: boolean;
  lastSaved: Date;
  submittedAt?: Date;
  progress: number; // 0-100
}

export interface StudentPortfolio {
  studentId: string;
  groupId: string;
  submissions: TaskSubmission[];
  completedTasks: number;
  totalTasks: number;
}
