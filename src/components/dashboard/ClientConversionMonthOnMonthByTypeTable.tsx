import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientConversionMonthOnMonthByTypeTableProps {
  data: NewClientData[];
  onRowClick?: (monthData: any) => void;
}

interface MonthlyStats {
  month: string;
  sortKey: string;
  type: string;
  totalMembers: number;
  newMembers: number;
  converted: number;
  retained: number;
  totalLTV: number;
  conversionIntervals: number[];
  visitsPostTrial: number[];
  clients: NewClientData[];
}

export const ClientConversionMonthOnMonthByTypeTable: React.FC<ClientConversionMonthOnMonthByTypeTableProps> = ({ data, onRowClick }) => {
  
  const monthlyDataByType = useMemo(() => {
    console.log('Processing month-on-month data by type:', data.length, 'records');
    
    // Debug: Check unique conversion and retention statuses
    const conversionStatuses = [...new Set(data.map(client => client.conversionStatus).filter(Boolean))];
    const retentionStatuses = [...new Set(data.map(client => client.retentionStatus).filter(Boolean))];
    console.log('Unique conversion statuses:', conversionStatuses);
    console.log('Unique retention statuses:', retentionStatuses);

    // Get unique isNew values
    const uniqueTypes = [...new Set(data.map(client => client.isNew || 'Unknown').filter(Boolean))];
    console.log('Unique isNew types found:', uniqueTypes);

    const monthlyStats: Record<string, MonthlyStats> = {};

    data.forEach(client => {
      const dateStr = client.firstVisitDate;
      if (!dateStr) return;

      let date: Date;
      
      // Handle different date formats consistently
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/');
        if (parts.length === 3) {
          // Try DD/MM/YYYY format first
          const [day, month, year] = parts;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // If invalid, try MM/DD/YYYY format
          if (isNaN(date.getTime())) {
            date = new Date(parseInt(year), parseInt(day) - 1, parseInt(month));
          }
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const clientType = client.isNew || 'Unknown';
      
      // Create unique key for month + type combination
      const key = `${monthKey}-${clientType}`;
      
      if (!monthlyStats[key]) {
        monthlyStats[key] = {
          month: monthName,
          sortKey: monthKey,
          type: clientType,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionIntervals: [],
          visitsPostTrial: [],
          clients: []
        };
      }
      
      const stat = monthlyStats[key];
      stat.totalMembers++;
      stat.clients.push(client);
      
      // Count new members - when isNew contains "new" (case insensitive)
      const isNewValue = (client.isNew || '').toLowerCase();
      if (isNewValue.includes('new')) {
        stat.newMembers++;
      }
      
      // Count conversions - exact match for consistency with other components
      if (client.conversionStatus === 'Converted') {
        stat.converted++;
      }
      
      // Count retention - exact match for consistency with other components  
      if (client.retentionStatus === 'Retained') {
        stat.retained++;
      }
      
      // Accumulate LTV
      stat.totalLTV += client.ltv || 0;
      
      // Track conversion intervals
      if (client.conversionSpan && client.conversionSpan > 0) {
        stat.conversionIntervals.push(client.conversionSpan);
      }
      
      // Track visits post trial
      if (client.visitsPostTrial && client.visitsPostTrial > 0) {
        stat.visitsPostTrial.push(client.visitsPostTrial);
      }
    });

    return Object.values(monthlyStats).sort((a, b) => {
      // First sort by month
      const monthCompare = a.sortKey.localeCompare(b.sortKey);
      if (monthCompare !== 0) return monthCompare;
      // Then sort by type (New first)
      if (a.type.toLowerCase().includes('new') && !b.type.toLowerCase().includes('new')) return -1;
      if (!a.type.toLowerCase().includes('new') && b.type.toLowerCase().includes('new')) return 1;
      return a.type.localeCompare(b.type);
    });
  }, [data]);

  // Prepare table data with calculated metrics
  const tableData = useMemo(() => {
    return monthlyDataByType.map(stat => {
      const conversionRate = stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0;
      // Fix: Retention rate should be retained from converted members, not total members
      const retentionRate = stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0;
      const avgLTV = stat.totalMembers > 0 ? stat.totalLTV / stat.totalMembers : 0;
      const avgConversionDays = stat.conversionIntervals.length > 0 
        ? stat.conversionIntervals.reduce((sum, interval) => sum + interval, 0) / stat.conversionIntervals.length 
        : 0;
      const avgVisits = stat.visitsPostTrial.length > 0 
        ? stat.visitsPostTrial.reduce((sum, visits) => sum + visits, 0) / stat.visitsPostTrial.length 
        : 0;

      return {
        ...stat,
        conversionRate,
        retentionRate,
        avgLTV,
        avgConversionDays,
        avgVisits
      };
    });
  }, [monthlyDataByType]);

  console.log('Month-on-month by type data prepared:', tableData.length, 'entries');

  // Calculate totals for the totals row
  const totals = useMemo(() => {
    return tableData.reduce((acc, row) => ({
      totalMembers: acc.totalMembers + row.totalMembers,
      newMembers: acc.newMembers + row.newMembers,
      converted: acc.converted + row.converted,
      retained: acc.retained + row.retained,
      totalLTV: acc.totalLTV + row.totalLTV,
      conversionIntervals: [...acc.conversionIntervals, ...row.conversionIntervals],
      visitsPostTrial: [...acc.visitsPostTrial, ...row.visitsPostTrial]
    }), {
      totalMembers: 0,
      newMembers: 0,
      converted: 0,
      retained: 0,
      totalLTV: 0,
      conversionIntervals: [] as number[],
      visitsPostTrial: [] as number[]
    });
  }, [tableData]);

  const totalsRow = useMemo(() => {
    const conversionRate = totals.newMembers > 0 ? (totals.converted / totals.newMembers) * 100 : 0;
    const retentionRate = totals.converted > 0 ? (totals.retained / totals.converted) * 100 : 0;
    const avgLTV = totals.totalMembers > 0 ? totals.totalLTV / totals.totalMembers : 0;
    const avgConversionDays = totals.conversionIntervals.length > 0 
      ? totals.conversionIntervals.reduce((sum, interval) => sum + interval, 0) / totals.conversionIntervals.length 
      : 0;
    const avgVisits = totals.visitsPostTrial.length > 0 
      ? totals.visitsPostTrial.reduce((sum, visits) => sum + visits, 0) / totals.visitsPostTrial.length 
      : 0;

    return {
      month: 'TOTALS',
      type: 'All Types',
      totalMembers: totals.totalMembers,
      newMembers: totals.newMembers,
      converted: totals.converted,
      retained: totals.retained,
      conversionRate,
      retentionRate,
      avgLTV,
      avgConversionDays,
      avgVisits
    };
  }, [totals]);

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Month-on-Month Analysis by Client Type
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
            {Object.keys(monthlyDataByType).length} Entries
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gray-50 border-none h-12">
                <TableHead className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-50 z-10 min-w-[100px]">Month</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Type</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Members</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">New</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[90px]">Converted</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Conv Rate</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Retained</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Ret Rate</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[100px]">Avg LTV</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[90px]">Avg Conv Days</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Avg Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow 
                  key={`${row.month}-${row.type}`}
                  className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 h-10"
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell className="font-semibold text-gray-900 text-xs px-4 sticky left-0 bg-white z-10 border-r">{row.month}</TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <Badge variant={row.type.toLowerCase().includes('new') ? 'default' : 'secondary'} className="text-xs">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.totalMembers)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.newMembers)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.converted)}</TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.conversionRate >= 50 ? 'text-green-600' : row.conversionRate >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.conversionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.retained)}</TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.retentionRate >= 70 ? 'text-green-600' : row.retentionRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.retentionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-right font-semibold text-emerald-600">{formatCurrency(row.avgLTV)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{row.avgConversionDays.toFixed(0)} days</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{row.avgVisits.toFixed(1)}</TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-gray-100 border-t-2 border-gray-300 font-bold hover:bg-gray-100">
                <TableCell className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-100 z-10 border-r">{totalsRow.month}</TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <Badge variant="outline" className="text-xs font-bold">
                    {totalsRow.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.totalMembers)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.newMembers)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.converted)}</TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.conversionRate >= 50 ? 'text-green-600' : totalsRow.conversionRate >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.conversionRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.retained)}</TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.retentionRate >= 70 ? 'text-green-600' : totalsRow.retentionRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.retentionRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-right font-bold text-emerald-600">{formatCurrency(totalsRow.avgLTV)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{totalsRow.avgConversionDays.toFixed(0)} days</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{totalsRow.avgVisits.toFixed(1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};