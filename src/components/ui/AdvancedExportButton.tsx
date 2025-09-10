import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAdvancedExport } from '@/hooks/useAdvancedExport';
import { format } from 'date-fns';
import { SalesData, SessionData, NewClientData, PayrollData, LateCancellationsData, DiscountAnalysisData } from '@/types/dashboard';
import { DateRange } from 'react-day-picker';
interface AdvancedExportButtonProps {
  salesData?: SalesData[];
  sessionsData?: SessionData[];
  newClientData?: NewClientData[];
  payrollData?: PayrollData[];
  lateCancellationsData?: LateCancellationsData[];
  discountData?: DiscountAnalysisData[];
  additionalData?: Record<string, any[]>;
  defaultFileName?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
export const AdvancedExportButton: React.FC<AdvancedExportButtonProps> = ({
  salesData = [],
  sessionsData = [],
  newClientData = [],
  payrollData = [],
  lateCancellationsData = [],
  discountData = [],
  additionalData = {},
  defaultFileName,
  size = 'default',
  variant = 'outline'
}) => {
  const {
    exportAllData,
    isExporting
  } = useAdvancedExport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [fileName, setFileName] = useState(defaultFileName || `dashboard-export-${format(new Date(), 'yyyy-MM-dd')}`);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedSections, setSelectedSections] = useState({
    sales: true,
    sessions: true,
    clientConversion: true,
    trainerPerformance: true,
    lateCancellations: true,
    discounts: true,
    additional: true
  });
  const handleExport = async () => {
    try {
      const exportData = {
        ...(selectedSections.sales && {
          salesData
        }),
        ...(selectedSections.sessions && {
          sessionsData
        }),
        ...(selectedSections.clientConversion && {
          newClientData
        }),
        ...(selectedSections.trainerPerformance && {
          payrollData
        }),
        ...(selectedSections.lateCancellations && {
          lateCancellationsData
        }),
        ...(selectedSections.discounts && {
          discountData
        }),
        ...(selectedSections.additional && {
          additionalData
        })
      };
      const options = {
        format: exportFormat,
        fileName,
        includeCharts,
        ...(dateRange?.from && dateRange?.to && {
          dateRange: {
            start: dateRange.from.toISOString(),
            end: dateRange.to.toISOString()
          }
        })
      };
      await exportAllData(exportData, options);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  const getTotalRecords = () => {
    let total = 0;
    if (selectedSections.sales) total += salesData.length;
    if (selectedSections.sessions) total += sessionsData.length;
    if (selectedSections.clientConversion) total += newClientData.length;
    if (selectedSections.trainerPerformance) total += payrollData.length;
    if (selectedSections.lateCancellations) total += lateCancellationsData.length;
    if (selectedSections.discounts) total += discountData.length;
    if (selectedSections.additional) {
      total += Object.values(additionalData).reduce((sum, data) => sum + data.length, 0);
    }
    return total;
  };
  return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2 font-semibold bg-purple-950 hover:bg-purple-800 text-base rounded-2xl text-violet-50 text-center">
          <Download className="w-4 h-4" />
          Export All Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Advanced Data Export
          </DialogTitle>
          <DialogDescription>
            Export comprehensive data from all dashboard sections. Choose your format and customize the export options.
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
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input id="filename" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Enter file name" />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range Filter (Optional)</Label>
            <DatePickerWithRange value={dateRange} onChange={setDateRange} className="w-full" />
          </div>

          {/* Data Sections */}
          <div className="space-y-3">
            <Label>Data Sections to Include</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="sales" checked={selectedSections.sales} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                sales: !!checked
              }))} />
                <Label htmlFor="sales" className="text-sm">
                  Sales Analytics ({salesData.length} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="sessions" checked={selectedSections.sessions} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                sessions: !!checked
              }))} />
                <Label htmlFor="sessions" className="text-sm">
                  Sessions Data ({sessionsData.length} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="clientConversion" checked={selectedSections.clientConversion} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                clientConversion: !!checked
              }))} />
                <Label htmlFor="clientConversion" className="text-sm">
                  Client Conversion ({newClientData.length} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="trainerPerformance" checked={selectedSections.trainerPerformance} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                trainerPerformance: !!checked
              }))} />
                <Label htmlFor="trainerPerformance" className="text-sm">
                  Trainer Performance ({payrollData.length} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="lateCancellations" checked={selectedSections.lateCancellations} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                lateCancellations: !!checked
              }))} />
                <Label htmlFor="lateCancellations" className="text-sm">
                  Late Cancellations ({lateCancellationsData.length} records)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="discounts" checked={selectedSections.discounts} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                discounts: !!checked
              }))} />
                <Label htmlFor="discounts" className="text-sm">
                  Discounts & Promotions ({discountData.length} records)
                </Label>
              </div>

              {Object.keys(additionalData).length > 0 && <div className="flex items-center space-x-2">
                  <Checkbox id="additional" checked={selectedSections.additional} onCheckedChange={checked => setSelectedSections(prev => ({
                ...prev,
                additional: !!checked
              }))} />
                  <Label htmlFor="additional" className="text-sm">
                    Additional Data ({Object.values(additionalData).reduce((sum, data) => sum + data.length, 0)} records)
                  </Label>
                </div>}
            </div>
          </div>

          {/* Additional Options */}
          {exportFormat === 'pdf' && <div className="flex items-center space-x-2">
              <Checkbox id="charts" checked={includeCharts} onCheckedChange={checked => setIncludeCharts(!!checked)} />
              <Label htmlFor="charts" className="text-sm">
                Include charts and visualizations (PDF only)
              </Label>
            </div>}

          {/* Export Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Export Summary:</strong>
              <br />
              Format: {exportFormat.toUpperCase()}
              <br />
              Total Records: {getTotalRecords().toLocaleString()}
              <br />
              Sections: {Object.values(selectedSections).filter(Boolean).length} selected
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || getTotalRecords() === 0} className="gap-2">
            {isExporting ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </> : <>
                <Download className="w-4 h-4" />
                Export {exportFormat.toUpperCase()}
              </>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};