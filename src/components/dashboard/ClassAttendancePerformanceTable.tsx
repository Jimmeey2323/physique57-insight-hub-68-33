import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Target, Users, Calendar, DollarSign, Activity, Zap, ChevronRight } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { ClassAttendanceDrillDownModal } from './ClassAttendanceDrillDownModal';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface ClassAttendancePerformanceTableProps {
  data: SessionData[];
}

export const ClassAttendancePerformanceTable: React.FC<ClassAttendancePerformanceTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('fillRate');
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    classFormat: string;
    stats: any;
  }>({ isOpen: false, classFormat: '', stats: null });

  const performanceData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const formatStats = data.reduce((acc, session) => {
      const format = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[format]) {
        acc[format] = {
          format,
          totalSessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          totalBooked: 0,
          totalLateCancelled: 0,
          emptySessions: 0,
          revenueGeneratingSessions: 0
        };
      }
      
      acc[format].totalSessions += 1;
      acc[format].totalCapacity += session.capacity || 0;
      acc[format].totalCheckedIn += session.checkedInCount || 0;
      acc[format].totalRevenue += session.totalPaid || 0;
      acc[format].totalBooked += session.bookedCount || 0;
      acc[format].totalLateCancelled += session.lateCancelledCount || 0;
      
      if ((session.checkedInCount || 0) === 0) acc[format].emptySessions += 1;
      if ((session.totalPaid || 0) > 0) acc[format].revenueGeneratingSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(formatStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.totalCapacity > 0 ? (stat.totalCheckedIn / stat.totalCapacity) * 100 : 0,
      showUpRate: stat.totalBooked > 0 ? (stat.totalCheckedIn / stat.totalBooked) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      avgRevenue: stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0,
      revenuePerAttendee: stat.totalCheckedIn > 0 ? stat.totalRevenue / stat.totalCheckedIn : 0,
      efficiency: stat.totalCapacity > 0 ? (stat.totalRevenue / stat.totalCapacity) : 0,
      cancellationRate: stat.totalBooked > 0 ? (stat.totalLateCancelled / stat.totalBooked) * 100 : 0,
      revenueEfficiency: stat.totalSessions > 0 ? (stat.revenueGeneratingSessions / stat.totalSessions) * 100 : 0
    })).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [data]);

  const metrics = [
    { id: 'fillRate', label: 'Fill Rate', icon: Target, color: 'blue' },
    { id: 'showUpRate', label: 'Show-up Rate', icon: Users, color: 'green' },
    { id: 'utilizationRate', label: 'Utilization', icon: Activity, color: 'purple' },
    { id: 'avgRevenue', label: 'Avg Revenue', icon: DollarSign, color: 'orange' },
    { id: 'efficiency', label: 'Revenue Efficiency', icon: TrendingUp, color: 'indigo' },
    { id: 'cancellationRate', label: 'Cancellation Rate', icon: Calendar, color: 'red' },
    { id: 'revenueEfficiency', label: 'Revenue Sessions %', icon: Zap, color: 'pink' },
    { id: 'revenuePerAttendee', label: 'Revenue per Attendee', icon: BarChart3, color: 'teal' }
  ];

  const getMetricValue = (row: any, metricId: string) => {
    const value = row[metricId];
    switch (metricId) {
      case 'avgRevenue':
      case 'revenuePerAttendee':
      case 'efficiency':
        return formatCurrency(value);
      case 'fillRate':
      case 'showUpRate':
      case 'utilizationRate':
      case 'cancellationRate':
      case 'revenueEfficiency':
        return formatPercentage(value);
      default:
        return formatNumber(value);
    }
  };

  const getMetricBadgeColor = (value: number, metricId: string) => {
    if (metricId === 'cancellationRate') {
      if (value <= 10) return 'bg-green-100 text-green-800';
      if (value <= 20) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    } else {
      if (value >= 80) return 'bg-green-100 text-green-800';
      if (value >= 60) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
  };

  const handleDrillDown = (classFormat: string, stats: any) => {
    setDrillDownModal({
      isOpen: true,
      classFormat,
      stats: {
        totalSessions: stats.totalSessions,
        totalCapacity: stats.totalCapacity,
        totalCheckedIn: stats.totalCheckedIn,
        totalRevenue: stats.totalRevenue,
        fillRate: stats.fillRate,
        showUpRate: stats.showUpRate,
        avgRevenue: stats.avgRevenue,
        emptySessions: stats.emptySessions,
      }
    });
  };

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-b-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold">Class Format Performance</div>
                <div className="text-sm text-white/80 font-normal">
                  Comprehensive analysis across all class formats
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                {performanceData.length} formats
              </Badge>
            </CardTitle>
            <DisplayedDataExportControls 
              tableData={performanceData.map(row => ({
                'Class Format': row.format,
                'Sessions': formatNumber(row.totalSessions),
                'Capacity': formatNumber(row.totalCapacity),
                'Attendance': formatNumber(row.totalCheckedIn),
                'Revenue': formatCurrency(row.totalRevenue),
                'Avg Revenue': formatCurrency(row.avgRevenue),
                'Fill Rate': formatPercentage(row.fillRate),
                'Show-up Rate': formatPercentage(row.showUpRate),
                'Utilization Rate': formatPercentage(row.utilizationRate),
                'Cancellation Rate': formatPercentage(row.cancellationRate),
                'Revenue Efficiency': formatPercentage(row.revenueEfficiency),
                'Revenue per Attendee': formatCurrency(row.revenuePerAttendee),
                'Empty Sessions': formatNumber(row.emptySessions),
                'Revenue Sessions': formatNumber(row.revenueGeneratingSessions)
              }))}
              tableHeaders={[
                'Class Format', 'Sessions', 'Capacity', 'Attendance', 'Revenue', 'Avg Revenue',
                'Fill Rate', 'Show-up Rate', 'Utilization Rate', 'Cancellation Rate',
                'Revenue Efficiency', 'Revenue per Attendee', 'Empty Sessions', 'Revenue Sessions'
              ]}
              tableName="Class Format Performance Analysis"
              filename="class-format-performance"
              variant="secondary"
              className="text-white"
            />
          </div>
        </div>
        
        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 mt-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Button
                key={metric.id}
                variant={selectedMetric === metric.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(metric.id)}
                className={`gap-2 text-sm transition-all duration-200 ${
                  selectedMetric === metric.id 
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
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
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200/60">
                <TableHead className="font-bold text-slate-700 sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 z-10 border-r border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Class Format
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    Sessions
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Capacity
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600" />
                    Attendance
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Revenue
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    {metrics.find(m => m.id === selectedMetric)?.label}
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-red-600" />
                    Empty Sessions
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    Performance
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleDrillDown(row.format, row)}
                >
                  <TableCell className="font-medium sticky left-0 bg-white z-10 border-r border-slate-200/60 group-hover:bg-gradient-to-r group-hover:from-blue-50/50 group-hover:to-purple-50/50">
                    <div className="flex items-center justify-between p-2">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-semibold text-base">{row.format}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {formatPercentage(row.utilizationRate)} utilized
                        </span>
                      </div>
                      <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatNumber(row.totalSessions)}</span>
                      <span className="text-xs text-gray-500">total</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatNumber(row.totalCapacity)}</span>
                      <span className="text-xs text-gray-500">capacity</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatNumber(row.totalCheckedIn)}</span>
                      <span className="text-xs text-gray-500">checked in</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatCurrency(row.totalRevenue)}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(row.avgRevenue)} avg</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getMetricBadgeColor(row[selectedMetric], selectedMetric)}>
                      {getMetricValue(row, selectedMetric)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium text-red-600">{formatNumber(row.emptySessions)}</span>
                      <span className="text-xs text-gray-500">empty</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(row.fillRate)} fill
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(row.showUpRate)} show-up
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Drill-down Modal */}
      <ClassAttendanceDrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ isOpen: false, classFormat: '', stats: null })}
        classFormat={drillDownModal.classFormat}
        sessionsData={data}
        overallStats={drillDownModal.stats || {}}
      />
    </Card>
  );
};