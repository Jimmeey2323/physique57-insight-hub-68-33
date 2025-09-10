import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileText, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { useAdvancedExport } from '@/hooks/useAdvancedExport';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TableExportControlsProps {
  data: any[];
  filename?: string;
  title?: string;
  additionalData?: Record<string, any[]>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const TableExportControls: React.FC<TableExportControlsProps> = ({
  data = [],
  filename,
  title = 'Data Export',
  additionalData = {},
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const { exportAllData, isExporting } = useAdvancedExport();
  const [copiedStates, setCopiedStates] = useState<{ csv: boolean; json: boolean }>({ 
    csv: false, 
    json: false 
  });

  const baseFilename = filename || `${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;

  const convertToCSV = (tableData: any[]): string => {
    if (!tableData || tableData.length === 0) return '';
    
    const headers = Object.keys(tableData[0]);
    const csvContent = [
      headers.join(','),
      ...tableData.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const handleCopyToClipboard = async (format: 'csv' | 'json') => {
    try {
      let content = '';
      
      if (format === 'csv') {
        content = convertToCSV(data);
      } else {
        content = JSON.stringify(data, null, 2);
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

  const handleExport = async (exportFormat: 'pdf' | 'csv') => {
    try {
      const exportData = {
        additionalData: {
          [title]: data,
          ...additionalData
        }
      };

      const options = {
        format: exportFormat,
        fileName: baseFilename
      };

      await exportAllData(exportData, options);
      toast.success(`${exportFormat.toUpperCase()} exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const totalRecords = data.length + Object.values(additionalData).reduce((sum, tableData) => sum + tableData.length, 0);

  if (totalRecords === 0) {
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
        disabled={data.length === 0}
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
        disabled={data.length === 0}
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
        disabled={isExporting || totalRecords === 0}
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
        disabled={isExporting || totalRecords === 0}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Export PDF
      </Button>

      {totalRecords > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {totalRecords.toLocaleString()} records
        </span>
      )}
    </div>
  );
};