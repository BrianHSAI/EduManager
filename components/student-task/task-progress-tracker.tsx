import { TaskField } from '@/lib/types';

export interface TextProgress {
  current: number;
  target: number;
  progress: number;
  isComplete: boolean;
  type: 'characters' | 'words' | 'solution';
}

export function calculateTaskProgress(fields: TaskField[], answers: Record<string, any>): number {
  if (fields.length === 0) return 0;
  
  let totalProgress = 0;
  
  for (const field of fields) {
    const answer = answers[field.id];
    let fieldProgress = 0;
    
    if (answer !== undefined && answer !== '' && answer !== null) {
      if (field.completionCriteria) {
        const textProgress = getTextProgress(field, String(answer));
        fieldProgress = textProgress ? textProgress.progress : 100;
      } else {
        fieldProgress = 100; // Field is answered
      }
    }
    
    totalProgress += fieldProgress;
  }
  
  return totalProgress / fields.length;
}

export function getTextProgress(field: TaskField, value: string): TextProgress | null {
  if (!field.completionCriteria) return null;
  
  const { type, target, solution } = field.completionCriteria;
  let current = 0;
  let isComplete = false;
  
  if (type === 'characters') {
    current = value.length;
    isComplete = current >= target;
  } else if (type === 'words') {
    current = value.trim() ? value.trim().split(/\s+/).length : 0;
    isComplete = current >= target;
  } else if (type === 'solution') {
    // For solution-based completion, check if the answer matches the expected solution
    current = solution && value.trim().toLowerCase() === solution.toLowerCase() ? 1 : 0;
    isComplete = current === 1;
  }
  
  const progress = Math.min((current / target) * 100, 100);
  
  return { current, target, progress, isComplete, type };
}

export function canSubmitTask(fields: TaskField[], answers: Record<string, any>): boolean {
  return fields.every(field => 
    !field.required || (answers[field.id] !== undefined && answers[field.id] !== '')
  );
}
