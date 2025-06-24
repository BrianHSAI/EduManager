import { Task, TaskField } from '@/lib/types';

export interface ExportData {
  task: Task;
  answers: Record<string, any>;
  studentId: string;
  submittedAt?: Date;
}

export async function exportToPDF(data: ExportData): Promise<void> {
  try {
    // Create a simple HTML structure for PDF export
    const htmlContent = generateHTMLContent(data);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Kunne ikke eksportere til PDF');
  }
}

export async function exportToWord(data: ExportData): Promise<void> {
  try {
    // Generate Word-compatible HTML
    const htmlContent = generateWordHTMLContent(data);
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], {
      type: 'application/msword'
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.task.title.replace(/[^a-zA-Z0-9]/g, '_')}_besvarelse.doc`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Kunne ikke eksportere til Word');
  }
}

function generateHTMLContent(data: ExportData): string {
  const { task, answers, submittedAt } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${task.title} - Besvarelse</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .task-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .task-description {
          color: #666;
          margin-bottom: 10px;
        }
        .meta-info {
          font-size: 14px;
          color: #888;
        }
        .field {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .field-label {
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .field-answer {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 3px;
          min-height: 20px;
        }
        .required {
          color: #d32f2f;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .field { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        <div class="meta-info">
          Fag: ${task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} | 
          ${submittedAt ? `Indsendt: ${submittedAt.toLocaleString('da-DK')}` : 'Ikke indsendt'}
        </div>
      </div>
      
      ${task.fields.map((field, index) => `
        <div class="field">
          <div class="field-label">
            ${index + 1}. ${field.label}
            ${field.required ? '<span class="required">*</span>' : ''}
          </div>
          <div class="field-answer">
            ${formatAnswerForDisplay(field, answers[field.id])}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

function generateWordHTMLContent(data: ExportData): string {
  const { task, answers, submittedAt } = data;
  
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${task.title} - Besvarelse</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotPromptForConvert/>
          <w:DoNotShowInsertionsAndDeletions/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
        }
        .header {
          border-bottom: 2pt solid black;
          padding-bottom: 12pt;
          margin-bottom: 18pt;
        }
        .task-title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 6pt;
        }
        .task-description {
          color: #666666;
          margin-bottom: 6pt;
        }
        .meta-info {
          font-size: 10pt;
          color: #888888;
        }
        .field {
          margin-bottom: 18pt;
          padding: 9pt;
          border: 1pt solid #dddddd;
        }
        .field-label {
          font-weight: bold;
          margin-bottom: 6pt;
        }
        .field-answer {
          background-color: #f9f9f9;
          padding: 6pt;
          min-height: 12pt;
        }
        .required {
          color: #d32f2f;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        <div class="meta-info">
          Fag: ${task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} | 
          ${submittedAt ? `Indsendt: ${submittedAt.toLocaleString('da-DK')}` : 'Ikke indsendt'}
        </div>
      </div>
      
      ${task.fields.map((field, index) => `
        <div class="field">
          <div class="field-label">
            ${index + 1}. ${field.label}
            ${field.required ? '<span class="required">*</span>' : ''}
          </div>
          <div class="field-answer">
            ${formatAnswerForDisplay(field, answers[field.id])}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

function formatAnswerForDisplay(field: TaskField, answer: any): string {
  if (answer === undefined || answer === null || answer === '') {
    return '<em>Ikke besvaret</em>';
  }
  
  switch (field.type) {
    case 'checkbox':
      return answer ? 'Ja' : 'Nej';
    case 'multiple-choice':
      return String(answer);
    case 'text':
    case 'textarea':
    case 'number':
      return String(answer).replace(/\n/g, '<br>');
    default:
      return String(answer);
  }
}
