import jsPDF from 'jspdf';
import { Task, TaskSubmission, User } from '../types';

function getStatusText(status: TaskSubmission['status']): string {
  switch (status) {
    case 'completed':
      return 'Færdig';
    case 'in-progress':
      return 'I gang';
    case 'needs-help':
      return 'Har brug for hjælp';
    default:
      return 'Ikke startet';
  }
}

export async function exportSubmissionToPDF(
  task: Task,
  submission: TaskSubmission,
  student: User
): Promise<boolean> {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const splitText = pdf.splitTextToSize(text, pdf.internal.pageSize.width - 2 * margin);
      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight + 5;
    };

    // Title
    addText(task.title, 18, true);
    yPosition += 10;

    // Student info
    addText(`Elev: ${student.name}`, 14, true);
    addText(`Email: ${student.email}`, 12);
    yPosition += 10;

    // Task description
    addText('Opgavebeskrivelse:', 14, true);
    addText(task.description, 12);
    yPosition += 10;

    // Submission info
    addText('Besvarelse:', 14, true);
    addText(`Status: ${getStatusText(submission.status)}`, 12);
    addText(`Fremskridt: ${Math.round(submission.progress)}%`, 12);
    addText(`Sidst gemt: ${submission.lastSaved.toLocaleDateString('da-DK')} ${submission.lastSaved.toLocaleTimeString('da-DK')}`, 12);
    
    if (submission.submittedAt) {
      addText(`Indsendt: ${submission.submittedAt.toLocaleDateString('da-DK')} ${submission.submittedAt.toLocaleTimeString('da-DK')}`, 12);
    }
    yPosition += 10;

    // Answers
    task.fields.forEach((field, index) => {
      const answer = submission.answers[field.id];
      const hasAnswer = answer !== undefined && answer !== null && answer !== '';
      
      addText(`${index + 1}. ${field.label}`, 12, true);
      addText(hasAnswer ? String(answer) : '[Ikke besvaret]', 12);
      yPosition += 5;
    });

    // Help requests if any
    if (submission.needsHelp) {
      yPosition += 10;
      addText('Hjælp anmodet', 14, true);
      addText('Eleven har anmodet om hjælp til denne opgave.', 12);
    }

    const fileName = `${task.title} - ${student.name}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

export async function exportAllSubmissionsToPDF(
  task: Task,
  submissions: TaskSubmission[],
  students: Record<string, User>
): Promise<boolean> {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const splitText = pdf.splitTextToSize(text, pdf.internal.pageSize.width - 2 * margin);
      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight + 5;
    };

    // Title
    addText(`Alle besvarelser: ${task.title}`, 18, true);
    yPosition += 10;

    // Task description
    addText(`Opgavebeskrivelse: ${task.description}`, 12);
    yPosition += 15;

    // All submissions
    submissions.forEach((submission, submissionIndex) => {
      const student = students[submission.studentId];
      if (!student) return;

      // Student header
      addText(`${submissionIndex + 1}. ${student.name}`, 16, true);
      addText(`Status: ${getStatusText(submission.status)} | Fremskridt: ${Math.round(submission.progress)}%`, 12);
      yPosition += 5;

      // Answers
      task.fields.forEach((field, fieldIndex) => {
        const answer = submission.answers[field.id];
        const hasAnswer = answer !== undefined && answer !== null && answer !== '';
        
        addText(`${fieldIndex + 1}. ${field.label}`, 12, true);
        addText(hasAnswer ? String(answer) : '[Ikke besvaret]', 12);
      });

      yPosition += 10;
    });

    const fileName = `Alle besvarelser - ${task.title}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting all submissions to PDF:', error);
    return false;
  }
}
