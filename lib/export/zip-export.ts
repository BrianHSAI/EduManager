import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Task, TaskSubmission, User } from '../types';
import { ExportFormat } from './types';
import { exportSubmissionToWord } from './word-export';
import { exportSubmissionToPDF } from './pdf-export';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';

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

export async function exportAllSubmissionsAsZip(
  task: Task,
  submissions: TaskSubmission[],
  students: Record<string, User>,
  format: ExportFormat
): Promise<boolean> {
  try {
    const zip = new JSZip();
    
    // Create individual files for each submission
    for (const submission of submissions) {
      const student = students[submission.studentId];
      if (!student) continue;

      if (format === 'word') {
        // Generate Word document
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                // Header
                new Paragraph({
                  children: [
                    new TextRun({
                      text: task.title,
                      bold: true,
                      size: 32,
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                }),
                
                // Student info
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Elev: ${student.name}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Email: ${student.email}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                
                // Task description
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Opgavebeskrivelse:',
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: task.description,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 400 },
                }),
                
                // Submission info
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Besvarelse:',
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Status: ${getStatusText(submission.status)}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Fremskridt: ${Math.round(submission.progress)}%`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                
                // Answers
                ...task.fields.flatMap((field, index) => {
                  const answer = submission.answers[field.id];
                  const hasAnswer = answer !== undefined && answer !== null && answer !== '';
                  
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${field.label}`,
                          bold: true,
                          size: 22,
                        }),
                      ],
                      spacing: { before: 300, after: 200 },
                    }),
                    
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: hasAnswer ? String(answer) : '[Ikke besvaret]',
                          size: 20,
                          italics: !hasAnswer,
                          color: hasAnswer ? '000000' : '666666',
                        }),
                      ],
                      spacing: { after: 200 },
                    }),
                  ];
                }),
                
                // Help requests if any
                ...(submission.needsHelp ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Hjælp anmodet',
                        bold: true,
                        size: 24,
                        color: 'DC2626',
                      }),
                    ],
                    spacing: { before: 400, after: 200 },
                  }),
                  
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Eleven har anmodet om hjælp til denne opgave.',
                        size: 20,
                        color: 'DC2626',
                      }),
                    ],
                    spacing: { after: 200 },
                  })
                ] : []),
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        const fileName = `${student.name}.docx`;
        zip.file(fileName, blob);
      } else {
        // Generate PDF
        const pdf = new jsPDF();
        let yPosition = 20;
        const lineHeight = 7;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 20;

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

        // Title and student info
        addText(task.title, 18, true);
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
        yPosition += 10;

        // Answers
        task.fields.forEach((field, index) => {
          const answer = submission.answers[field.id];
          const hasAnswer = answer !== undefined && answer !== null && answer !== '';
          
          addText(`${index + 1}. ${field.label}`, 12, true);
          addText(hasAnswer ? String(answer) : '[Ikke besvaret]', 12);
        });

        // Help requests if any
        if (submission.needsHelp) {
          yPosition += 10;
          addText('Hjælp anmodet', 14, true);
          addText('Eleven har anmodet om hjælp til denne opgave.', 12);
        }

        const pdfBlob = pdf.output('blob');
        const fileName = `${student.name}.pdf`;
        zip.file(fileName, pdfBlob);
      }
    }

    // Generate and download the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = `${task.title} - Alle besvarelser.zip`;
    saveAs(zipBlob, zipFileName);
    
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
}
