import { User, Group, Task, TaskSubmission, TaskField } from './types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Lars Hansen',
    email: 'lars.hansen@skole.dk',
    role: 'teacher',
    avatar: '/avatars/shadcn.jpg'
  },
  {
    id: '2',
    name: 'Emma Nielsen',
    email: 'emma.nielsen@elev.dk',
    role: 'student'
  },
  {
    id: '3',
    name: 'Mikkel Andersen',
    email: 'mikkel.andersen@elev.dk',
    role: 'student'
  },
  {
    id: '4',
    name: 'Sofia Larsen',
    email: 'sofia.larsen@elev.dk',
    role: 'student'
  },
  {
    id: '5',
    name: 'Oliver Jensen',
    email: 'oliver.jensen@elev.dk',
    role: 'student'
  },
  {
    id: '6',
    name: 'Anna Petersen',
    email: 'anna.petersen@elev.dk',
    role: 'student'
  },
  {
    id: '7',
    name: 'Marcus Thomsen',
    email: 'marcus.thomsen@elev.dk',
    role: 'student'
  }
];

// Mock groups
export const mockGroups: Group[] = [
  {
    id: '1',
    name: '7A Matematik',
    description: 'Matematik klasse for 7. årgang A',
    teacherId: '1',
    students: mockUsers.filter(u => u.role === 'student'),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '7A Dansk',
    description: 'Dansk klasse for 7. årgang A',
    teacherId: '1',
    students: mockUsers.filter(u => u.role === 'student').slice(0, 3),
    createdAt: new Date('2024-01-15')
  }
];

// Mock task fields
const mathFields: TaskField[] = [
  {
    id: 'f1',
    type: 'text',
    label: 'Hvad er 15 + 27?',
    required: true
  },
  {
    id: 'f2',
    type: 'textarea',
    label: 'Forklar hvordan du løste opgaven',
    placeholder: 'Skriv din forklaring her...',
    required: false
  },
  {
    id: 'f3',
    type: 'multiple-choice',
    label: 'Hvilken af følgende er korrekt?',
    options: ['42', '41', '43', '40'],
    required: true
  }
];

const danishFields: TaskField[] = [
  {
    id: 'f4',
    type: 'textarea',
    label: 'Skriv et kort essay om dit yndlingsemne (minimum 200 ord)',
    placeholder: 'Begynd dit essay her...',
    required: true
  },
  {
    id: 'f5',
    type: 'multiple-choice',
    label: 'Hvilken ordklasse er ordet "hurtigt"?',
    options: ['Navneord', 'Tillægsord', 'Biord', 'Udsagnsord'],
    required: true
  }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Grundlæggende Addition',
    description: 'Øv dig i at lægge tal sammen og forklar din fremgangsmåde',
    subject: 'matematik',
    fields: mathFields,
    groupId: '1',
    teacherId: '1',
    assignedStudents: ['2', '3', '4', '5'],
    assignmentType: 'class',
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-12-15')
  },
  {
    id: '2',
    title: 'Kreativ Skrivning',
    description: 'Skriv et essay om et emne du interesserer dig for',
    subject: 'dansk',
    fields: danishFields,
    groupId: '2',
    teacherId: '1',
    assignedStudents: ['2', '3', '4'],
    assignmentType: 'class',
    dueDate: new Date('2024-12-30'),
    createdAt: new Date('2024-12-16')
  },
  {
    id: '3',
    title: 'Individuel Matematik Øvelse',
    description: 'Specialiseret matematik opgave for udvalgte elever',
    subject: 'matematik',
    fields: mathFields,
    groupId: undefined,
    teacherId: '1',
    assignedStudents: ['2', '4'],
    assignmentType: 'individual',
    dueDate: new Date('2024-12-28'),
    createdAt: new Date('2024-12-17')
  }
];

// Mock submissions
export const mockSubmissions: TaskSubmission[] = [
  {
    id: '1',
    taskId: '1',
    studentId: '2',
    answers: {
      'f1': '42',
      'f2': 'Jeg lagde 15 og 27 sammen ved at...',
      'f3': '42'
    },
    status: 'completed',
    needsHelp: false,
    lastSaved: new Date('2024-12-18T10:30:00'),
    submittedAt: new Date('2024-12-18T10:30:00'),
    progress: 100
  },
  {
    id: '2',
    taskId: '1',
    studentId: '3',
    answers: {
      'f1': '42',
      'f2': '',
      'f3': ''
    },
    status: 'needs-help',
    needsHelp: true,
    lastSaved: new Date('2024-12-18T14:15:00'),
    progress: 33
  },
  {
    id: '3',
    taskId: '1',
    studentId: '4',
    answers: {
      'f1': '42',
      'f2': 'Jeg brugte mine fingre til at tælle',
      'f3': '42'
    },
    status: 'in-progress',
    needsHelp: false,
    lastSaved: new Date('2024-12-18T16:45:00'),
    progress: 85
  },
  {
    id: '4',
    taskId: '2',
    studentId: '2',
    answers: {
      'f4': 'Mit yndlingsemne er astronomi fordi...',
      'f5': 'Biord'
    },
    status: 'in-progress',
    needsHelp: false,
    lastSaved: new Date('2024-12-18T12:20:00'),
    progress: 60
  }
];

// Helper functions
export const getCurrentUser = (): User => mockUsers[0]; // Teacher for demo

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
