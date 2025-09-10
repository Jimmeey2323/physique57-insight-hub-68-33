import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, FileSpreadsheet, Loader2, Copy, Check, Settings2, Eye, Table } from 'lucide-react';
import { useDisplayedDataExport } from '@/hooks/useDisplayedDataExport';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DisplayedTable {
  id: string;
  name: string;
  element: HTMLTableElement | null;
  rowCount: number;
  columnCount: number;
  isVisible: boolean;
}

interface AdvancedTabExportControlsProps {
  tabName: string;
  tabId?: string;
  defaultFileName?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export const AdvancedTabExportControls: React.FC<AdvancedTabExportControlsProps> = ({
  tabName,
  tabId,
  defaultFileName,
  size = 'default',
  variant = 'outline',
  className = '',
  onExportStart,
  onExportComplete
}) => {
  const { exportDisplayedData, isExporting, scanForTables, scanForTablesIncludingSubTabs } = useDisplayedDataExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [fileName, setFileName] = useState(defaultFileName || `${tabName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd-HHmm')}`);
  const [discoveredTables, setDiscoveredTables] = useState<DisplayedTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<Record<string, boolean>>({});
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    preserveFormatting: true,
    includeRowNumbers: false,
    separateSheets: true,
    includeMetadata: true
  });
  const [isScanning, setIsScanning] = useState(false);
  const [includeSubTabs, setIncludeSubTabs] = useState(true);

  const handleScanTables = async () => {
    setIsScanning(true);
    try {
      const tabContainer = tabId ? document.querySelector(`[data-tab-id="${tabId}"]`) : document;
      const tables = includeSubTabs 
        ? await scanForTablesIncludingSubTabs(tabContainer as HTMLElement)
        : scanForTables(tabContainer as HTMLElement);
      
      setDiscoveredTables(tables);
      
      // Auto-select all tables with rows
      const autoSelected = tables.reduce((acc, table) => ({
        ...acc,
        [table.id]: table.rowCount > 0
      }), {} as Record<string, boolean>);
      setSelectedTables(autoSelected);
      
      toast.success(`Found ${tables.length} tables (${tables.filter(t => t.isVisible).length} visible)`);
    } catch (error) {
      console.error('Error scanning tables:', error);
      toast.error('Failed to scan tables');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = async () => {
    try {
      onExportStart?.();
      
      const tablesToExport = discoveredTables.filter(table => selectedTables[table.id]);
      
      if (tablesToExport.length === 0) {
        toast.error('Please select at least one table to export');
        return;
      }

      const exportConfig = {
        format: exportFormat,
        fileName,
        options: exportOptions,
        tables: tablesToExport,
        tabName
      };

      await exportDisplayedData(exportConfig);
      toast.success(`${exportFormat.toUpperCase()} exported successfully`);
      setIsDialogOpen(false);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const handleCopyDisplayedData = async () => {
    try {
      const tablesToCopy = discoveredTables.filter(table => selectedTables[table.id]);
      
      if (tablesToCopy.length === 0) {
        toast.error('No tables selected to copy');
        return;
      }

      // Extract displayed data from selected tables
      let clipboardContent = `${tabName} - Exported Data\n`;
      clipboardContent += `Generated: ${format(new Date(), 'PPP p')}\n\n`;

      tablesToCopy.forEach(table => {
        if (table.element) {
          clipboardContent += `${table.name}\n`;
          clipboardContent += `${'-'.repeat(table.name.length)}\n`;
          
          // Extract table data as displayed
          const rows = Array.from(table.element.querySelectorAll('tr'));
          rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            const rowData = cells.map(cell => cell.textContent?.trim() || '').join('\t');
            clipboardContent += `${rowData}\n`;
          });
          clipboardContent += '\n';
        }
      });

      await navigator.clipboard.writeText(clipboardContent);
      toast.success('Table data copied to clipboard');
    } catch (error) {
      console.error('Failed to copy data:', error);
      toast.error('Failed to copy data');
    }
  };

  const getTotalSelectedRecords = () => {
    return discoveredTables
      .filter(table => selectedTables[table.id])
      .reduce((sum, table) => sum + table.rowCount, 0);
  };

  // Open dialog and scan tables automatically
  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open && discoveredTables.length === 0) {
      setTimeout(handleScanTables, 100); // Small delay to ensure dialog is rendered
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quick Copy Button */}
      <Button
        variant="ghost"
        size={size}
        onClick={handleCopyDisplayedData}
        className="gap-2"
        disabled={discoveredTables.length === 0}
      >
        <Copy className="w-4 h-4" />
        Copy Tables
      </Button>

      {/* Advanced Export Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className="gap-2 font-semibold"
          >
            <Download className="w-4 h-4" />
            Export {tabName}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" />
              Advanced Export - {tabName}
            </DialogTitle>
            <DialogDescription>
              Export displayed table data exactly as shown, with all formatting preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Table Discovery Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label className="text-base font-semibold">Discovered Tables</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="includeSubTabs"
                      checked={includeSubTabs}
                      onCheckedChange={(checked) => setIncludeSubTabs(!!checked)}
                    />
                    <Label htmlFor="includeSubTabs" className="text-sm">Include sub-tabs</Label>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleScanTables}
                  disabled={isScanning}
                  className="gap-2"
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {isScanning ? 'Scanning...' : 'Rescan Tables'}
                </Button>
              </div>

              {discoveredTables.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {discoveredTables.map(table => (
                    <div key={table.id} className="flex items-center justify-between space-x-2 p-2 border rounded">
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox 
                          id={table.id}
                          checked={selectedTables[table.id] || false}
                          onCheckedChange={checked => 
                            setSelectedTables(prev => ({
                              ...prev,
                              [table.id]: !!checked
                            }))
                          }
                          disabled={table.rowCount === 0}
                        />
                        <Label htmlFor={table.id} className="flex-1">
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {table.rowCount} rows × {table.columnCount} cols
                            {!table.isVisible && ' (hidden)'}
                            {table.rowCount === 0 && ' (empty)'}
                          </div>
                        </Label>
                      </div>
                      {table.rowCount > 0 && (
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Ready
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isScanning ? 'Scanning for tables...' : 'No tables discovered. Click "Rescan Tables" to find available data.'}
                </div>
              )}
            </div>

            <Separator />

            {/* Export Configuration */}
            <div className="grid grid-cols-2 gap-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Format</Label>
                <RadioGroup value={exportFormat} onValueChange={(value: 'pdf' | 'csv' | 'excel') => setExportFormat(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Report (Best for viewing)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV Files (Universal compatibility)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel Workbook (Advanced features)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="headers"
                      checked={exportOptions.includeHeaders}
                      onCheckedChange={checked => 
                        setExportOptions(prev => ({ ...prev, includeHeaders: !!checked }))
                      }
                    />
                    <Label htmlFor="headers" className="text-sm">Include table headers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="formatting"
                      checked={exportOptions.preserveFormatting}
                      onCheckedChange={checked => 
                        setExportOptions(prev => ({ ...prev, preserveFormatting: !!checked }))
                      }
                    />
                    <Label htmlFor="formatting" className="text-sm">Preserve number formatting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rowNumbers"
                      checked={exportOptions.includeRowNumbers}
                      onCheckedChange={checked => 
                        setExportOptions(prev => ({ ...prev, includeRowNumbers: !!checked }))
                      }
                    />
                    <Label htmlFor="rowNumbers" className="text-sm">Include row numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="separateSheets"
                      checked={exportOptions.separateSheets}
                      onCheckedChange={checked => 
                        setExportOptions(prev => ({ ...prev, separateSheets: !!checked }))
                      }
                      disabled={exportFormat === 'csv'}
                    />
                    <Label htmlFor="separateSheets" className="text-sm">
                      Separate sheets/pages per table
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="metadata"
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={checked => 
                        setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                      }
                    />
                    <Label htmlFor="metadata" className="text-sm">Include export metadata</Label>
                  </div>
                </div>
              </div>
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

            {/* Export Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4" />
                <span className="font-semibold">Export Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Format:</strong> {exportFormat.toUpperCase()}</div>
                  <div><strong>Tables:</strong> {Object.values(selectedTables).filter(Boolean).length} selected</div>
                </div>
                <div>
                  <div><strong>Total Rows:</strong> {getTotalSelectedRecords().toLocaleString()}</div>
                  <div><strong>Formatting:</strong> {exportOptions.preserveFormatting ? 'Preserved' : 'Plain'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Export will capture data exactly as displayed in the tables
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting || getTotalSelectedRecords() === 0} 
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
                    Export ({getTotalSelectedRecords().toLocaleString()} rows)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};