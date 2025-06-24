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
    type: 'characters' | 'words' | 'solution';
    target: number;
    solution?: string; // For solution-based completion
  }; // For text and textarea fields
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string; // Changed from union type to string to allow any subject
  fields: TaskField[];
  groupId?: string; // Optional - can be null if assigning to individual students
  teacherId: string;
  assignedStudents: string[]; // Individual student IDs
  assignmentType: 'class' | 'individual'; // New field to track assignment type
  dueDate?: Date;
  createdAt: Date;
  resources?: TaskResource[]; // Optional resources/links for students
  status?: 'active' | 'completed'; // New field for task status
}

export interface TaskResource {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface HelpMessage {
  id: string;
  submissionId: string;
  studentId: string;
  teacherId?: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  category: 'understanding' | 'technical' | 'content' | 'other';
  isFromStudent: boolean;
  createdAt: Date;
  readAt?: Date;
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
  helpMessages?: HelpMessage[]; // Help conversation thread
  hasUnreadHelp?: boolean; // For student to know if teacher responded
}

export interface StudentPortfolio {
  studentId: string;
  groupId: string;
  submissions: TaskSubmission[];
  completedTasks: number;
  totalTasks: number;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  studentEmail: string;
  studentId?: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: Date;
  respondedAt?: Date;
  group?: Group; // Optional populated group data
  invitedByUser?: User; // Optional populated teacher data
}

export interface ConnectionRequest {
  id: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  studentClass: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
  student?: User; // Optional populated student data
  teacher?: User; // Optional populated teacher data
}
