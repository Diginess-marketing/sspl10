import type { PlayerResult, PlayerExportOptions, PlayerExportResult } from '@/types/playerData';

class PlayerExportService {
  /**
   * Export player data in various formats
   */
  async exportPlayerData(
    data: PlayerResult[],
    options: PlayerExportOptions
  ): Promise<PlayerExportResult> {
    try {
      if (data.length === 0) {
        return {
          success: false,
          error: 'No data to export',
          recordCount: 0,
        };
      }

      let filename: string;
      let blob: Blob;

      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (options.format) {
        case 'csv':
          const csvContent = this.generateCSV(data, options.includeFields);
          filename = `player-results-${timestamp}.csv`;
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          break;

        case 'json':
          const jsonContent = JSON.stringify(data, null, 2);
          filename = `player-results-${timestamp}.json`;
          blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
          break;

        case 'pdf':
          // For PDF export, we'll use HTML to PDF conversion
          const pdfContent = this.generateHTMLForPDF(data, options.includeFields);
          filename = `player-results-${timestamp}.pdf`;
          blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8;' });
          break;

        default:
          return {
            success: false,
            error: 'Unsupported export format',
            recordCount: data.length,
          };
      }

      // Create and trigger download
      this.triggerDownload(blob, filename);

      return {
        success: true,
        downloadUrl: URL.createObjectURL(blob),
        filename,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        recordCount: data.length,
      };
    }
  }

  /**
   * Generate CSV content from player data
   */
  private generateCSV(data: PlayerResult[], includeFields: (keyof PlayerResult)[]): string {
    if (includeFields.length === 0) {
      includeFields = ['name', 'mobile', 'email', 'state', 'timing', 'proficiency', 'marks', 'remarks'];
    }

    // Create header row
    const headers = includeFields.map(field => this.formatFieldName(field));
    const csvRows = [headers.join(',')];

    // Add data rows
    data.forEach(player => {
      const row = includeFields.map(field => {
        const value = player[field];
        return this.escapeCSVValue(value);
      });
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Generate HTML content for PDF export
   */
  private generateHTMLForPDF(data: PlayerResult[], includeFields: (keyof PlayerResult)[]): string {
    if (includeFields.length === 0) {
      includeFields = ['name', 'mobile', 'email', 'state', 'timing', 'proficiency', 'marks', 'remarks'];
    }

    const timestamp = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SSPL Player Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            color: #3b82f6;
            font-size: 24px;
            font-weight: bold;
          }
          .title {
            font-size: 28px;
            margin: 10px 0;
            color: #1f2937;
          }
          .subtitle {
            color: #6b7280;
            font-size: 14px;
          }
          .table-container {
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .marks-cell {
            text-align: center;
            font-weight: bold;
          }
          .remarks-cell {
            text-align: center;
          }
          .remarks-good { color: #059669; }
          .remarks-average { color: #d97706; }
          .remarks-poor { color: #dc2626; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .summary {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SSPL</div>
          <div class="title">Player Trial Results</div>
          <div class="subtitle">Generated on ${timestamp}</div>
        </div>
    `;

    // Add summary
    const marksStats = this.calculateMarksStats(data);
    html += `
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Players:</strong> ${data.length}</p>
          <p><strong>Average Marks:</strong> ${marksStats.average.toFixed(1)}</p>
          <p><strong>Highest Marks:</strong> ${marksStats.max}</p>
          <p><strong>Lowest Marks:</strong> ${marksStats.min}</p>
        </div>
    `;

    // Add table
    html += `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                ${includeFields.map(field => `<th>${this.formatFieldName(field)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    data.forEach(player => {
      html += '<tr>';
      includeFields.forEach(field => {
        let cellValue = String(player[field] || '');
        let cellClass = '';
        
        if (field === 'marks') {
          cellClass = 'marks-cell';
        } else if (field === 'remarks') {
          const remarks = player[field].toLowerCase();
          if (remarks.includes('good') || remarks.includes('bowling good')) {
            cellClass = 'remarks-good';
          } else if (remarks.includes('poor')) {
            cellClass = 'remarks-poor';
          } else {
            cellClass = 'remarks-average';
          }
        }
        
        html += `<td class="${cellClass}">${cellValue}</td>`;
      });
      html += '</tr>';
    });

    html += `
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SSPL - Sports Excellence Platform</p>
          <p>This report contains confidential player information</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Format field name for display
   */
  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Escape CSV value
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Calculate marks statistics
   */
  private calculateMarksStats(data: PlayerResult[]) {
    const marks = data.map(p => p.marks);
    return {
      min: Math.min(...marks),
      max: Math.max(...marks),
      average: marks.reduce((sum, mark) => sum + mark, 0) / marks.length,
    };
  }

  /**
   * Trigger file download
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Generate printable view
   */
  generatePrintableView(data: PlayerResult[], includeFields: (keyof PlayerResult)[]): string {
    return this.generateHTMLForPDF(data, includeFields);
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats() {
    return [
      { format: 'csv' as const, label: 'CSV File', description: 'Comma-separated values for spreadsheet applications' },
      { format: 'json' as const, label: 'JSON File', description: 'JavaScript Object Notation for data processing' },
      { format: 'pdf' as const, label: 'PDF Report', description: 'Formatted report for printing and sharing' },
    ];
  }

  /**
   * Validate export options
   */
  validateExportOptions(options: PlayerExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['csv', 'json', 'pdf'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (!options.includeFields || options.includeFields.length === 0) {
      errors.push('At least one field must be selected for export');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const playerExportService = new PlayerExportService();