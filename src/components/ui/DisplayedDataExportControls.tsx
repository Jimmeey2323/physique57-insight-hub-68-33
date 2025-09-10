import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileText, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

interface DisplayedDataExportControlsProps {
  tableData: any[]; // The exact data displayed in the table
  tableHeaders: string[]; // The column headers as shown in the table
  tableName: string;
  filename?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  formatters?: Record<string, (value: any) => string>; // Custom formatters for specific columns
}

export const DisplayedDataExportControls: React.FC<DisplayedDataExportControlsProps> = ({
  tableData = [],
  tableHeaders = [],
  tableName,
  filename,
  size = 'sm',
  variant = 'outline',
  className = '',
  formatters = {}
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ csv: boolean; json: boolean }>({ 
    csv: false, 
    json: false 
  });

  const baseFilename = filename || `${tableName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;

  // Extract displayed values from table data using the exact same processing as shown in UI
  const extractDisplayedData = () => {
    return tableData.map(row => {
      const processedRow: Record<string, any> = {};
      
      tableHeaders.forEach(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        let value = row[key] || row[header] || '';
        
        // Apply custom formatter if available
        if (formatters[header]) {
          value = formatters[header](value);
        } else if (formatters[key]) {
          value = formatters[key](value);
        }
        
        processedRow[header] = value;
      });
      
      return processedRow;
    });
  };

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';
    
    const headers = tableHeaders;
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (format: 'csv' | 'json') => {
    try {
      const displayedData = extractDisplayedData();
      let content = '';
      
      if (format === 'csv') {
        content = convertToCSV(displayedData);
      } else {
        content = JSON.stringify(displayedData, null, 2);
      }
      
      await navigator.clipboard.writeText(content);
      
      setCopiedStates(prev => ({ ...prev, [format]: true }));
      toast.success(`${format.toUpperCase()} data copied to clipboard`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [format]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleExport = async (exportFormat: 'csv' | 'pdf') => {
    setIsExporting(true);
    
    try {
      const displayedData = extractDisplayedData();
      
      if (exportFormat === 'csv') {
        const csvContent = convertToCSV(displayedData);
        downloadCSV(csvContent, `${baseFilename}.csv`);
        toast.success('CSV exported successfully');
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll create a simple PDF with the table data
        const { jsPDF } = await import('jspdf');
        require('jspdf-autotable');
        
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(16);
        pdf.text(tableName, 20, 20);
        
        // Add export date
        pdf.setFontSize(10);
        pdf.text(`Exported: ${format(new Date(), 'PPP p')}`, 20, 30);
        
        // Add table
        (pdf as any).autoTable({
          head: [tableHeaders],
          body: displayedData.map(row => tableHeaders.map(header => row[header] || '')),
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: { left: 20, right: 20 },
        });
        
        pdf.save(`${baseFilename}.pdf`);
        toast.success('PDF exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (tableData.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Copy to Clipboard Buttons */}
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleCopyToClipboard('csv')}
        className="gap-2"
        disabled={tableData.length === 0}
      >
        {copiedStates.csv ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy CSV
      </Button>

      <Button
        variant="ghost"
        size={size}
        onClick={() => handleCopyToClipboard('json')}
        className="gap-2"
        disabled={tableData.length === 0}
      >
        {copiedStates.json ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy JSON
      </Button>

      {/* Export Buttons */}
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport('csv')}
        disabled={isExporting || tableData.length === 0}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        Export CSV
      </Button>

      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport('pdf')}
        disabled={isExporting || tableData.length === 0}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Export PDF
      </Button>

      {tableData.length > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {tableData.length.toLocaleString()} displayed records
        </span>
      )}
    </div>
  );
};