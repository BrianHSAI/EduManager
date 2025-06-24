import { Task, TaskSubmission, User } from '../types';

export type ExportFormat = 'word' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeTaskDescription?: boolean;
  includeStudentInfo?: boolean;
  includeSubmissionInfo?: boolean;
  includeHelpRequests?: boolean;
}

export interface BulkExportOptions extends ExportOptions {
  asZip?: boolean;
  individualFiles?: boolean;
}

export interface ExportData {
  task: Task;
  submission: TaskSubmission;
  student: User;
}

export interface BulkExportData {
  task: Task;
  submissions: TaskSubmission[];
  students: Record<string, User>;
}
