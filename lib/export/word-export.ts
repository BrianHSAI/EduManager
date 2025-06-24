import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
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

export async function exportSubmissionToWord(
  task: Task,
  submission: TaskSubmission,
  student: User
): Promise<boolean> {
  try {
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
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `Sidst gemt: ${submission.lastSaved.toLocaleDateString('da-DK')} ${submission.lastSaved.toLocaleTimeString('da-DK')}`,
                  size: 20,
                }),
              ],
              spacing: { after: submission.submittedAt ? 100 : 400 },
            }),
            
            ...(submission.submittedAt ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Indsendt: ${submission.submittedAt.toLocaleDateString('da-DK')} ${submission.submittedAt.toLocaleTimeString('da-DK')}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 400 },
              })
            ] : []),
            
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
    const fileName = `${task.title} - ${student.name}.docx`;
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Word:', error);
    return false;
  }
}

export async function exportAllSubmissionsToWord(
  task: Task,
  submissions: TaskSubmission[],
  students: Record<string, User>
): Promise<boolean> {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: `Alle besvarelser: ${task.title}`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `Opgavebeskrivelse: ${task.description}`,
                  size: 20,
                }),
              ],
              spacing: { before: 400, after: 600 },
            }),
            
            // All submissions
            ...submissions.flatMap((submission, submissionIndex) => {
              const student = students[submission.studentId];
              if (!student) return [];
              
              return [
                // Student header
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${submissionIndex + 1}. ${student.name}`,
                      bold: true,
                      size: 26,
                    }),
                  ],
                  spacing: { before: 600, after: 200 },
                  heading: HeadingLevel.HEADING_2,
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Status: ${getStatusText(submission.status)} | Fremskridt: ${Math.round(submission.progress)}%`,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
                
                // Answers
                ...task.fields.flatMap((field, fieldIndex) => {
                  const answer = submission.answers[field.id];
                  const hasAnswer = answer !== undefined && answer !== null && answer !== '';
                  
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${fieldIndex + 1}. ${field.label}`,
                          bold: true,
                          size: 20,
                        }),
                      ],
                      spacing: { before: 200, after: 100 },
                    }),
                    
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: hasAnswer ? String(answer) : '[Ikke besvaret]',
                          size: 18,
                          italics: !hasAnswer,
                          color: hasAnswer ? '000000' : '666666',
                        }),
                      ],
                      spacing: { after: 150 },
                    }),
                  ];
                }),
              ];
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Alle besvarelser - ${task.title}.docx`;
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting all submissions to Word:', error);
    return false;
  }
}
