import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp, TrendingDown, Minus, Target, Users, DollarSign, Activity } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface ClassAttendanceMonthOnMonthTableProps {
  data: SessionData[];
}

export const ClassAttendanceMonthOnMonthTable: React.FC<ClassAttendanceMonthOnMonthTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('attendance');

  const monthOnMonthData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by month
    const monthlyStats = data.reduce((acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          sessions: 0,
          capacity: 0,
          attendance: 0,
          revenue: 0,
          booked: 0,
          lateCancelled: 0,
          emptySessions: 0,
          formats: new Set()
        };
      }
      
      acc[monthKey].sessions += 1;
      acc[monthKey].capacity += session.capacity || 0;
      acc[monthKey].attendance += session.checkedInCount || 0;
      acc[monthKey].revenue += session.totalPaid || 0;
      acc[monthKey].booked += session.bookedCount || 0;
      acc[monthKey].lateCancelled += session.lateCancelledCount || 0;
      acc[monthKey].formats.add(session.cleanedClass || session.classType);
      
      if ((session.checkedInCount || 0) === 0) acc[monthKey].emptySessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by month
    const monthlyArray = Object.values(monthlyStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.capacity > 0 ? (stat.attendance / stat.capacity) * 100 : 0,
      showUpRate: stat.booked > 0 ? (stat.attendance / stat.booked) * 100 : 0,
      utilizationRate: stat.sessions > 0 ? ((stat.sessions - stat.emptySessions) / stat.sessions) * 100 : 0,
      avgRevenue: stat.sessions > 0 ? stat.revenue / stat.sessions : 0,
      revenuePerAttendee: stat.attendance > 0 ? stat.revenue / stat.attendance : 0,
      formatCount: stat.formats.size
    })).sort((a, b) => b.month.localeCompare(a.month));

    // Calculate month-on-month changes
    return monthlyArray.map((current, index) => {
      const previous = monthlyArray[index + 1];
      if (!previous) return { ...current, changes: {} };

      const calculateChange = (currentValue: number, previousValue: number) => {
        if (previousValue === 0) return { value: 0, percentage: 0 };
        const change = currentValue - previousValue;
        const percentage = (change / previousValue) * 100;
        return { value: change, percentage };
      };

      return {
        ...current,
        changes: {
          sessions: calculateChange(current.sessions, previous.sessions),
          attendance: calculateChange(current.attendance, previous.attendance),
          revenue: calculateChange(current.revenue, previous.revenue),
          fillRate: calculateChange(current.fillRate, previous.fillRate),
          showUpRate: calculateChange(current.showUpRate, previous.showUpRate),
          utilizationRate: calculateChange(current.utilizationRate, previous.utilizationRate),
          avgRevenue: calculateChange(current.avgRevenue, previous.avgRevenue)
        }
      };
    });
  }, [data]);

  const metrics = [
    { id: 'attendance', label: 'Attendance', icon: Users, color: 'blue' },
    { id: 'sessions', label: 'Sessions', icon: Calendar, color: 'green' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'orange' },
    { id: 'fillRate', label: 'Fill Rate', icon: Target, color: 'purple' },
    { id: 'utilizationRate', label: 'Utilization', icon: Activity, color: 'indigo' }
  ];

  const formatMetricValue = (value: number, metricId: string) => {
    switch (metricId) {
      case 'revenue':
      case 'avgRevenue':
        return formatCurrency(value);
      case 'fillRate':
      case 'showUpRate':
      case 'utilizationRate':
        return formatPercentage(value);
      default:
        return formatNumber(value);
    }
  };

  const getTrendIcon = (change: any) => {
    if (!change || change.percentage === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change.percentage > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (change: any) => {
    if (!change || change.percentage === 0) return 'text-gray-600';
    if (change.percentage > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Month-on-Month Performance Analysis
            <Badge variant="outline" className="text-purple-600">
              {monthOnMonthData.length} months
            </Badge>
          </CardTitle>
          <DisplayedDataExportControls 
            tableData={monthOnMonthData}
            tableHeaders={['Month', 'Sessions', 'Attendance', 'Revenue', 'Fill Rate', 'Utilization', 'MoM Change', 'Formats']}
            tableName="Class Attendance Month-on-Month"
            filename="class-attendance-month-on-month"
            formatters={{
              'Revenue': (value) => formatCurrency(value),
              'Fill Rate': (value) => formatPercentage(value),
              'Utilization': (value) => formatPercentage(value),
              'Sessions': (value) => formatNumber(value),
              'Attendance': (value) => formatNumber(value)
            }}
          />
        </div>
        
        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Button
                key={metric.id}
                variant={selectedMetric === metric.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(metric.id)}
                className="gap-1 text-xs"
              >
                <Icon className="w-3 h-3" />
                {metric.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">Month</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Sessions</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Attendance</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Revenue</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Fill Rate</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Utilization</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">MoM Change</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Formats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthOnMonthData.map((row, index) => {
                const change = row.changes?.[selectedMetric];
                return (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{row.month}</span>
                        <span className="text-xs text-gray-500">
                          {row.formatCount} formats
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatNumber(row.sessions)}</span>
                        <span className="text-xs text-gray-500">
                          {row.emptySessions} empty
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatNumber(row.attendance)}</span>
                        <span className="text-xs text-gray-500">
                          of {formatNumber(row.capacity)} capacity
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatCurrency(row.revenue)}</span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(row.avgRevenue)} avg
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          row.fillRate >= 80 ? 'bg-green-100 text-green-800' :
                          row.fillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.fillRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          row.utilizationRate >= 90 ? 'bg-green-100 text-green-800' :
                          row.utilizationRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.utilizationRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {change ? (
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(change)}
                          <span className={`text-sm font-medium ${getTrendColor(change)}`}>
                            {Math.abs(change.percentage).toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.formatCount}</span>
                        <span className="text-xs text-gray-500">active</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};