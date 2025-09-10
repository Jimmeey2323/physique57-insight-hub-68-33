import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, Loader2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TabDataset {
  name: string;
  displayedData: any[]; // The exact data as shown in the table
  headers: string[];    // The column headers as displayed
  enabled: boolean;
  formatters?: Record<string, (value: any) => string>;
}

interface ComprehensiveTabExportControlsProps {
  datasets: TabDataset[];
  tabName: string;
  defaultFileName?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const ComprehensiveTabExportControls: React.FC<ComprehensiveTabExportControlsProps> = ({
  datasets = [],
  tabName,
  defaultFileName,
  size = 'default',
  variant = 'outline',
  className = ''
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('csv');
  const [fileName, setFileName] = useState(defaultFileName || `${tabName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}`);
  const [selectedDatasets, setSelectedDatasets] = useState<Record<string, boolean>>(
    datasets.reduce((acc, dataset) => ({ ...acc, [dataset.name]: dataset.enabled }), {})
  );
  const [copiedStates, setCopiedStates] = useState<{ csv: boolean; json: boolean }>({ 
    csv: false, 
    json: false 
  });

  const getEnabledDatasets = () => {
    return datasets.filter(dataset => selectedDatasets[dataset.name] && dataset.displayedData.length > 0);
  };

  const getTotalRecords = () => {
    return getEnabledDatasets().reduce((sum, dataset) => sum + dataset.displayedData.length, 0);
  };

  const processDatasetForExport = (dataset: TabDataset) => {
    return dataset.displayedData.map(row => {
      const processedRow: Record<string, any> = {};
      
      dataset.headers.forEach(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        let value = row[key] || row[header] || '';
        
        // Apply custom formatter if available
        if (dataset.formatters && dataset.formatters[header]) {
          value = dataset.formatters[header](value);
        } else if (dataset.formatters && dataset.formatters[key]) {
          value = dataset.formatters[key](value);
        }
        
        processedRow[header] = value;
      });
      
      return processedRow;
    });
  };

  const convertToCSV = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) return '';
    
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

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const enabledDatasets = getEnabledDatasets();
      if (enabledDatasets.length === 0) {
        toast.error('Please select at least one dataset to export');
        return;
      }

      if (exportFormat === 'csv') {
        // Combine all datasets into one CSV with section headers
        const csvSections = enabledDatasets.map(dataset => {
          const processedData = processDatasetForExport(dataset);
          const csvData = convertToCSV(processedData, dataset.headers);
          return `${dataset.name}\n${csvData}`;
        });
        const combinedCSV = csvSections.join('\n\n');
        
        downloadCSV(combinedCSV, `${fileName}.csv`);
        toast.success('CSV exported successfully');
      } else if (exportFormat === 'pdf') {
        // For PDF, create a comprehensive document with all tables
        const { jsPDF } = await import('jspdf');
        require('jspdf-autotable');
        
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(20);
        pdf.text(`${tabName} - Complete Export`, 20, 20);
        
        // Add export date
        pdf.setFontSize(10);
        pdf.text(`Exported: ${format(new Date(), 'PPP p')}`, 20, 30);
        
        let yPosition = 45;
        
        enabledDatasets.forEach((dataset, index) => {
          const processedData = processDatasetForExport(dataset);
          
          // Check if we need a new page
          if (yPosition > 180) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Add dataset title
          pdf.setFontSize(14);
          pdf.text(dataset.name, 20, yPosition);
          yPosition += 10;
          
          // Add table
          (pdf as any).autoTable({
            head: [dataset.headers],
            body: processedData.map(row => dataset.headers.map(header => row[header] || '')),
            startY: yPosition,
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
          
          yPosition = (pdf as any).lastAutoTable.finalY + 15;
        });
        
        pdf.save(`${fileName}.pdf`);
        toast.success('PDF exported successfully');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async (format: 'csv' | 'json') => {
    try {
      const enabledDatasets = getEnabledDatasets();
      if (enabledDatasets.length === 0) {
        toast.error('No data available to copy');
        return;
      }

      let content = '';
      
      if (format === 'csv') {
        // Combine all datasets into one CSV with section headers
        const csvSections = enabledDatasets.map(dataset => {
          const processedData = processDatasetForExport(dataset);
          const csvData = convertToCSV(processedData, dataset.headers);
          return `${dataset.name}\n${csvData}`;
        });
        content = csvSections.join('\n\n');
      } else {
        // JSON format with nested structure
        const jsonData = enabledDatasets.reduce((acc, dataset) => ({
          ...acc,
          [dataset.name]: processDatasetForExport(dataset)
        }), {});
        content = JSON.stringify(jsonData, null, 2);
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

  const totalRecords = getTotalRecords();

  if (datasets.length === 0 || datasets.every(d => d.displayedData.length === 0)) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quick Copy Buttons */}
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleCopyToClipboard('csv')}
        className="gap-2"
        disabled={totalRecords === 0}
      >
        {copiedStates.csv ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy All CSV
      </Button>

      {/* Advanced Export Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className="gap-2 font-semibold"
            disabled={totalRecords === 0}
          >
            <Download className="w-4 h-4" />
            Export {tabName}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export {tabName} Data
            </DialogTitle>
            <DialogDescription>
              Export displayed data from all tables in the {tabName} tab. This captures exactly what you see in the interface.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Export Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV Spreadsheet (Displays exactly as shown)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Report (Formatted tables)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Name */}
            <div className="space-y-2">
              <Label htmlFor="filename">File Name</Label>
              <Input 
                id="filename" 
                value={fileName} 
                onChange={e => setFileName(e.target.value)} 
                placeholder="Enter file name" 
              />
            </div>

            {/* Dataset Selection */}
            <div className="space-y-3">
              <Label>Tables to Include (Displayed Data Only)</Label>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {datasets.map(dataset => (
                  <div key={dataset.name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={dataset.name}
                      checked={selectedDatasets[dataset.name] || false}
                      onCheckedChange={checked => 
                        setSelectedDatasets(prev => ({
                          ...prev,
                          [dataset.name]: !!checked
                        }))
                      }
                      disabled={dataset.displayedData.length === 0}
                    />
                    <Label htmlFor={dataset.name} className="text-sm flex-1">
                      {dataset.name} ({dataset.displayedData.length.toLocaleString()} displayed records)
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                <strong>Export Summary:</strong>
                <br />
                Format: {exportFormat.toUpperCase()}
                <br />
                Total Displayed Records: {getTotalRecords().toLocaleString()}
                <br />
                Tables: {getEnabledDatasets().length} selected
                <br />
                <em>Note: Only the processed data visible in tables will be exported</em>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || getTotalRecords() === 0} 
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {totalRecords > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {totalRecords.toLocaleString()} displayed records
        </span>
      )}
    </div>
  );
};