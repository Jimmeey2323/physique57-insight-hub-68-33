import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, Loader2, Copy, Check } from 'lucide-react';
import { useAdvancedExport } from '@/hooks/useAdvancedExport';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TabDataset {
  name: string;
  data: any[];
  enabled: boolean;
}

interface TabLevelExportControlsProps {
  datasets: TabDataset[];
  tabName: string;
  defaultFileName?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const TabLevelExportControls: React.FC<TabLevelExportControlsProps> = ({
  datasets = [],
  tabName,
  defaultFileName,
  size = 'default',
  variant = 'outline',
  className = ''
}) => {
  const { exportAllData, isExporting } = useAdvancedExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    return datasets.filter(dataset => selectedDatasets[dataset.name] && dataset.data.length > 0);
  };

  const getTotalRecords = () => {
    return getEnabledDatasets().reduce((sum, dataset) => sum + dataset.data.length, 0);
  };

  const convertToCSV = (data: any[], headers?: string[]): string => {
    if (!data || data.length === 0) return '';
    
    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => {
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

  const handleExport = async () => {
    try {
      const enabledDatasets = getEnabledDatasets();
      if (enabledDatasets.length === 0) {
        toast.error('Please select at least one dataset to export');
        return;
      }

      const additionalData = enabledDatasets.reduce((acc, dataset) => ({
        ...acc,
        [dataset.name]: dataset.data
      }), {});

      const exportData = { additionalData };

      const options = {
        format: exportFormat,
        fileName
      };

      await exportAllData(exportData, options);
      toast.success(`${exportFormat.toUpperCase()} exported successfully`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
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
          const csvData = convertToCSV(dataset.data);
          return `${dataset.name}\n${csvData}`;
        });
        content = csvSections.join('\n\n');
      } else {
        // JSON format with nested structure
        const jsonData = enabledDatasets.reduce((acc, dataset) => ({
          ...acc,
          [dataset.name]: dataset.data
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

  if (datasets.length === 0 || datasets.every(d => d.data.length === 0)) {
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
              Export data from all tables in the {tabName} tab. Choose your format and select which datasets to include.
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
                      CSV Spreadsheet
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Report
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
              <Label>Datasets to Include</Label>
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
                      disabled={dataset.data.length === 0}
                    />
                    <Label htmlFor={dataset.name} className="text-sm flex-1">
                      {dataset.name} ({dataset.data.length.toLocaleString()} records)
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
                Total Records: {getTotalRecords().toLocaleString()}
                <br />
                Datasets: {getEnabledDatasets().length} selected
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
          {totalRecords.toLocaleString()} total records
        </span>
      )}
    </div>
  );
};