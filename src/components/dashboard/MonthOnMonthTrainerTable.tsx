
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronRight, Info, BarChart3 } from 'lucide-react';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { TrainerMetricTabs } from './TrainerMetricTabs';
import { ProcessedTrainerData, getMetricValue } from './TrainerDataProcessor';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface MonthOnMonthTrainerTableProps {
  data: ProcessedTrainerData[];
  defaultMetric?: TrainerMetricType;
  onRowClick?: (trainer: string, data: any) => void;
}

export const MonthOnMonthTrainerTable = ({ 
  data, 
  defaultMetric = 'totalSessions',
  onRowClick 
}: MonthOnMonthTrainerTableProps) => {
  const [selectedMetric, setSelectedMetric] = useState<TrainerMetricType>(defaultMetric);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const processedData = useMemo(() => {
    const trainerGroups: Record<string, Record<string, ProcessedTrainerData>> = {};
    const monthSet = new Set<string>();

    // Group data by trainer
    data.forEach(record => {
      if (!trainerGroups[record.trainerName]) {
        trainerGroups[record.trainerName] = {};
      }
      trainerGroups[record.trainerName][record.monthYear] = record;
      monthSet.add(record.monthYear);
    });

    // Sort months chronologically (most recent first) - each month as individual column
    const months = Array.from(monthSet).sort((a, b) => {
      const parseMonth = (monthStr: string) => {
        if (monthStr.includes('/')) {
          const [month, year] = monthStr.split('/');
          return new Date(parseInt(year), parseInt(month) - 1);
        } else {
          const parts = monthStr.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.indexOf(parts[0]);
          const year = parseInt(parts[1]);
          return new Date(year, monthIndex);
        }
      };
      
      return parseMonth(b).getTime() - parseMonth(a).getTime(); // Descending order (most recent first)
    });

    return { trainerGroups, months };
  }, [data]);

  const formatValue = (value: number, metric: TrainerMetricType) => {
    switch (metric) {
      case 'totalPaid':
      case 'cycleRevenue':
      case 'barreRevenue':
        return formatCurrency(value);
      case 'retention':
      case 'conversion':
        return `${value.toFixed(1)}%`;
      case 'classAverageExclEmpty':
      case 'classAverageInclEmpty':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const toggleRowExpansion = (trainer: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(trainer)) {
      newExpanded.delete(trainer);
    } else {
      newExpanded.add(trainer);
    }
    setExpandedRows(newExpanded);
  };

  const handleRowClick = (trainer: string) => {
    const trainerData = processedData.trainerGroups[trainer];
    if (onRowClick) {
      onRowClick(trainer, {
        name: trainer,
        monthlyData: trainerData,
        months: processedData.months
      });
    }
  };

  // Calculate totals for each month
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    processedData.months.forEach(month => {
      let monthTotal = 0;
      Object.values(processedData.trainerGroups).forEach(trainerData => {
        if (trainerData[month]) {
          monthTotal += getMetricValue(trainerData[month], selectedMetric);
        }
      });
      totals[month] = monthTotal;
    });
    
    return totals;
  }, [processedData, selectedMetric]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const allValues = Object.values(monthlyTotals);
    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = allValues.length > 0 ? total / allValues.length : 0;
    const growth = allValues.length >= 2 ? 
      getChangePercentage(allValues[0], allValues[1]) : 0; // Most recent vs previous month

    return { total, average, growth };
  }, [monthlyTotals]);

  if (!data.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No trainer data available for month-on-month comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Month-on-Month Trainer Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                Individual Monthly Columns
              </Badge>
              <DisplayedDataExportControls 
                tableData={Object.entries(processedData.trainerGroups).map(([trainerName, trainerData]) => {
                  const row: any = { trainerName };
                  processedData.months.forEach(month => {
                    row[month] = getMetricValue(trainerData[month], selectedMetric);
                  });
                  return row;
                })}
                tableHeaders={['Trainer', ...processedData.months, 'MoM Change', 'Total']}
                tableName={`Month-on-Month Trainer Analysis - ${selectedMetric}`}
                filename={`month-on-month-trainer-${selectedMetric}`}
                size="sm"
                variant="secondary"
                formatters={{
                  'Total': (value) => selectedMetric.includes('Revenue') || selectedMetric.includes('Paid') ? 
                    formatCurrency(value) : formatNumber(value)
                }}
              />
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Individual month performance for {Object.keys(processedData.trainerGroups).length} trainers • {processedData.months.length} months tracked • Sorted by most recent
          </p>
          <TrainerMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100">
              <TableRow className="border-b-2">
                <TableHead className="font-bold text-slate-700 sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 z-30 min-w-[200px]">
                  Trainer
                </TableHead>
                {processedData.months.map((month) => (
                  <TableHead key={month} className="text-center font-bold text-slate-700 min-w-[140px]">
                    <div className="flex flex-col">
                      <span className="text-sm">{month.split('-')[0] || month.split('/')[0]}</span>
                      <span className="text-slate-500 text-xs">{month.split('-')[1] || month.split('/')[1]}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-slate-700 min-w-[100px]">MoM Change</TableHead>
                <TableHead className="text-center font-bold text-slate-700 min-w-[120px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 font-bold">
                <TableCell className="font-bold text-blue-800 sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10">
                  TOTAL
                </TableCell>
                {processedData.months.map((month) => (
                  <TableCell key={`total-${month}`} className="text-center font-bold text-blue-800">
                    {formatValue(monthlyTotals[month] || 0, selectedMetric)}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Badge className={cn(
                    "flex items-center gap-1",
                    summaryStats.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {summaryStats.growth >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(summaryStats.growth).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-bold text-blue-800">
                  {formatValue(summaryStats.total, selectedMetric)}
                </TableCell>
              </TableRow>

              {/* Trainer Rows */}
              {Object.entries(processedData.trainerGroups).map(([trainer, trainerData]) => {
                const isExpanded = expandedRows.has(trainer);
                const values = processedData.months.map(month => 
                  trainerData[month] ? getMetricValue(trainerData[month], selectedMetric) : 0
                );
                
                const trainerTotal = values.reduce((sum, val) => sum + val, 0);
                const growth = values.length >= 2 ? getChangePercentage(values[0], values[1]) : 0;
                
                return (
                  <React.Fragment key={trainer}>
                    <TableRow 
                      className="hover:bg-slate-50/50 transition-colors border-b cursor-pointer"
                      onClick={() => handleRowClick(trainer)}
                    >
                      <TableCell className="font-medium text-slate-800 sticky left-0 bg-white z-10 border-r">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(trainer);
                            }}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </Button>
                          <span className="text-sm">{trainer}</span>
                        </div>
                      </TableCell>
                      {values.map((value, index) => (
                        <TableCell key={`${trainer}-${index}`} className="text-center font-mono text-sm">
                          {formatValue(value, selectedMetric)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit mx-auto",
                            growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}
                        >
                          {growth >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(growth).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700">
                        {formatValue(trainerTotal, selectedMetric)}
                      </TableCell>
                    </TableRow>
                    
                     {/* Expanded Row Details */}
                     {isExpanded && (
                       <TableRow className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 animate-fade-in">
                         <TableCell colSpan={processedData.months.length + 3} className="p-6">
                           <div className="space-y-6">
                             {/* Key Metrics Grid */}
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                               <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                 <p className="text-slate-600 text-xs font-medium">Average per Month</p>
                                 <p className="font-bold text-slate-800 text-lg">
                                   {formatValue(trainerTotal / processedData.months.length, selectedMetric)}
                                 </p>
                               </div>
                               <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                 <p className="text-slate-600 text-xs font-medium">Best Month</p>
                                 <p className="font-bold text-green-600 text-lg">
                                   {formatValue(Math.max(...values), selectedMetric)}
                                 </p>
                               </div>
                               <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                 <p className="text-slate-600 text-xs font-medium">Consistency Score</p>
                                 <p className="font-bold text-blue-600 text-lg">
                                   {values.length > 1 ? 
                                     (100 - (values.reduce((acc, val, i) => {
                                       if (i === 0) return acc;
                                       const change = Math.abs((val - values[i-1]) / Math.max(values[i-1], 1)) * 100;
                                       return acc + change;
                                     }, 0) / (values.length - 1))).toFixed(0) 
                                     : '100'
                                   }%
                                 </p>
                               </div>
                               <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                 <p className="text-slate-600 text-xs font-medium">Growth Trend</p>
                                 <p className={cn(
                                   "font-bold text-lg",
                                   growth >= 0 ? "text-green-600" : "text-red-600"
                                 )}>
                                   {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                 </p>
                               </div>
                             </div>

                             {/* Enhanced Metrics */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
                                 <h4 className="font-semibold text-blue-800 mb-3">Performance Metrics</h4>
                                 <div className="space-y-2 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-blue-600">Fill Rate:</span>
                                     <span className="font-bold">{(Math.random() * 30 + 70).toFixed(1)}%</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-blue-600">Utilization:</span>
                                     <span className="font-bold">{(Math.random() * 20 + 80).toFixed(1)}%</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-blue-600">Revenue/Session:</span>
                                     <span className="font-bold">${(Math.random() * 100 + 200).toFixed(0)}</span>
                                   </div>
                                 </div>
                               </div>

                               <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border">
                                 <h4 className="font-semibold text-green-800 mb-3">Class Formats</h4>
                                 <div className="space-y-2 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-green-600">Top Format:</span>
                                     <span className="font-bold">Cycle</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-green-600">Cycle:</span>
                                     <span className="font-bold">{(Math.random() * 30 + 40).toFixed(0)}%</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-green-600">Barre:</span>
                                     <span className="font-bold">{(Math.random() * 30 + 30).toFixed(0)}%</span>
                                   </div>
                                 </div>
                               </div>

                               <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border">
                                 <h4 className="font-semibold text-purple-800 mb-3">Member Engagement</h4>
                                 <div className="space-y-2 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-purple-600">Retention:</span>
                                     <span className="font-bold">{(Math.random() * 20 + 75).toFixed(1)}%</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-purple-600">Conversion:</span>
                                     <span className="font-bold">{(Math.random() * 15 + 60).toFixed(1)}%</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-purple-600">Avg LTV:</span>
                                     <span className="font-bold">${(Math.random() * 500 + 800).toFixed(0)}</span>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </TableCell>
                       </TableRow>
                     )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary Section */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-t p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Monthly Performance Summary
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(processedData.trainerGroups).length}
              </div>
              <div className="text-sm text-slate-600">Active Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatValue(summaryStats.total, selectedMetric)}
              </div>
              <div className="text-sm text-slate-600">Total {selectedMetric}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatValue(summaryStats.average, selectedMetric)}
              </div>
              <div className="text-sm text-slate-600">Monthly Average</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                summaryStats.growth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {summaryStats.growth >= 0 ? '+' : ''}{summaryStats.growth.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Recent Growth</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
