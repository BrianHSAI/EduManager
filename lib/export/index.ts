import { Task, TaskSubmission, User } from '../types';
import { ExportFormat, ExportOptions, BulkExportOptions } from './types';
import { exportSubmissionToWord, exportAllSubmissionsToWord } from './word-export';
import { exportSubmissionToPDF, exportAllSubmissionsToPDF } from './pdf-export';
import { exportAllSubmissionsAsZip } from './zip-export';

// Export types for external use
export type { ExportFormat, ExportOptions, BulkExportOptions } from './types';

/**
 * Export a single submission in the specified format
 */
export async function exportSubmission(
  task: Task,
  submission: TaskSubmission,
  student: User,
  format: ExportFormat = 'word'
): Promise<boolean> {
  try {
    if (format === 'word') {
      return await exportSubmissionToWord(task, submission, student);
    } else {
      return await exportSubmissionToPDF(task, submission, student);
    }
  } catch (error) {
    console.error('Error exporting submission:', error);
    return false;
  }
}

/**
 * Export all submissions for a task in the specified format
 */
export async function exportAllSubmissions(
  task: Task,
  submissions: TaskSubmission[],
  students: Record<string, User>,
  format: ExportFormat = 'word'
): Promise<boolean> {
  try {
    if (format === 'word') {
      return await exportAllSubmissionsToWord(task, submissions, students);
    } else {
      return await exportAllSubmissionsToPDF(task, submissions, students);
    }
  } catch (error) {
    console.error('Error exporting all submissions:', error);
    return false;
  }
}

/**
 * Export all submissions as individual files in a zip archive
 */
export async function exportAllSubmissionsAsZipFile(
  task: Task,
  submissions: TaskSubmission[],
  students: Record<string, User>,
  format: ExportFormat = 'word'
): Promise<boolean> {
  try {
    return await exportAllSubmissionsAsZip(task, submissions, students, format);
  } catch (error) {
    console.error('Error exporting submissions as zip:', error);
    return false;
  }
}

/**
 * Get a human-readable format name
 */
export function getFormatDisplayName(format: ExportFormat): string {
  switch (format) {
    case 'word':
      return 'Word Document';
    case 'pdf':
      return 'PDF Document';
    default:
      return 'Unknown Format';
  }
}

/**
 * Get the file extension for a format
 */
export function getFormatExtension(format: ExportFormat): string {
  switch (format) {
    case 'word':
      return '.docx';
    case 'pdf':
      return '.pdf';
    default:
      return '';
  }
}

// Re-export individual functions for backward compatibility
export { exportSubmissionToWord, exportAllSubmissionsToWord } from './word-export';
export { exportSubmissionToPDF, exportAllSubmissionsToPDF } from './pdf-export';
export { exportAllSubmissionsAsZip } from './zip-export';
