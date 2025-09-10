import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Clock, Users, Target, Zap, AlertTriangle, CheckCircle, XCircle, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface ClassAttendanceUtilizationTableProps {
  data: SessionData[];
}

export const ClassAttendanceUtilizationTable: React.FC<ClassAttendanceUtilizationTableProps> = ({ data }) => {
  const [selectedView, setSelectedView] = useState('timeSlot');

  const utilizationData = useMemo(() => {
    if (!data || data.length === 0) return { timeSlot: [], dayOfWeek: [], trainer: [] };

    // Time slot utilization
    const timeSlotStats = data.reduce((acc, session) => {
      const timeSlot = session.time || 'Unknown';
      if (!acc[timeSlot]) {
        acc[timeSlot] = {
          timeSlot,
          totalSessions: 0,
          totalCapacity: 0,
          totalAttendance: 0,
          emptySessions: 0,
          lowAttendanceSessions: 0,
          fullSessions: 0,
          formats: new Set()
        };
      }
      
      acc[timeSlot].totalSessions += 1;
      acc[timeSlot].totalCapacity += session.capacity || 0;
      acc[timeSlot].totalAttendance += session.checkedInCount || 0;
      acc[timeSlot].formats.add(session.cleanedClass || session.classType);
      
      const attendance = session.checkedInCount || 0;
      const capacity = session.capacity || 0;
      
      if (attendance === 0) acc[timeSlot].emptySessions += 1;
      else if (capacity > 0 && (attendance / capacity) < 0.5) acc[timeSlot].lowAttendanceSessions += 1;
      else if (capacity > 0 && (attendance / capacity) >= 0.9) acc[timeSlot].fullSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const timeSlotData = Object.values(timeSlotStats).map((stat: any) => ({
      ...stat,
      formatCount: stat.formats.size,
      fillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      avgAttendance: stat.totalSessions > 0 ? stat.totalAttendance / stat.totalSessions : 0,
      efficiency: stat.totalSessions > 0 ? stat.fullSessions / stat.totalSessions * 100 : 0
    })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    // Day of week utilization
    const dayStats = data.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      if (!acc[day]) {
        acc[day] = {
          day,
          totalSessions: 0,
          totalCapacity: 0,
          totalAttendance: 0,
          emptySessions: 0,
          lowAttendanceSessions: 0,
          fullSessions: 0,
          formats: new Set()
        };
      }
      
      acc[day].totalSessions += 1;
      acc[day].totalCapacity += session.capacity || 0;
      acc[day].totalAttendance += session.checkedInCount || 0;
      acc[day].formats.add(session.cleanedClass || session.classType);
      
      const attendance = session.checkedInCount || 0;
      const capacity = session.capacity || 0;
      
      if (attendance === 0) acc[day].emptySessions += 1;
      else if (capacity > 0 && (attendance / capacity) < 0.5) acc[day].lowAttendanceSessions += 1;
      else if (capacity > 0 && (attendance / capacity) >= 0.9) acc[day].fullSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOfWeekData = Object.values(dayStats).map((stat: any) => ({
      ...stat,
      formatCount: stat.formats.size,
      fillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      avgAttendance: stat.totalSessions > 0 ? stat.totalAttendance / stat.totalSessions : 0,
      efficiency: stat.totalSessions > 0 ? stat.fullSessions / stat.totalSessions * 100 : 0
    })).sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    // Trainer utilization
    const trainerStats = data.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainer,
          totalSessions: 0,
          totalCapacity: 0,
          totalAttendance: 0,
          emptySessions: 0,
          lowAttendanceSessions: 0,
          fullSessions: 0,
          formats: new Set()
        };
      }
      
      acc[trainer].totalSessions += 1;
      acc[trainer].totalCapacity += session.capacity || 0;
      acc[trainer].totalAttendance += session.checkedInCount || 0;
      acc[trainer].formats.add(session.cleanedClass || session.classType);
      
      const attendance = session.checkedInCount || 0;
      const capacity = session.capacity || 0;
      
      if (attendance === 0) acc[trainer].emptySessions += 1;
      else if (capacity > 0 && (attendance / capacity) < 0.5) acc[trainer].lowAttendanceSessions += 1;
      else if (capacity > 0 && (attendance / capacity) >= 0.9) acc[trainer].fullSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const trainerData = Object.values(trainerStats).map((stat: any) => ({
      ...stat,
      formatCount: stat.formats.size,
      fillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      avgAttendance: stat.totalSessions > 0 ? stat.totalAttendance / stat.totalSessions : 0,
      efficiency: stat.totalSessions > 0 ? stat.fullSessions / stat.totalSessions * 100 : 0
    })).sort((a, b) => b.totalSessions - a.totalSessions);

    return {
      timeSlot: timeSlotData,
      dayOfWeek: dayOfWeekData,
      trainer: trainerData
    };
  }, [data]);

  const views = [
    { id: 'timeSlot', label: 'By Time Slot', icon: Clock, key: 'timeSlot' },
    { id: 'dayOfWeek', label: 'By Day', icon: Calendar, key: 'day' },
    { id: 'trainer', label: 'By Trainer', icon: Users, key: 'trainer' }
  ];

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 90) return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (rate >= 70) return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { color: 'bg-red-100 text-red-800', icon: XCircle };
  };

  const currentData = utilizationData[selectedView as keyof typeof utilizationData] || [];
  const currentKey = views.find(v => v.id === selectedView)?.key || 'timeSlot';

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-b-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold">Utilization Analysis</div>
              <div className="text-sm text-white/80 font-normal">
                Performance breakdown by time slots, trainers, and schedules
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
              {currentData.length} items
            </Badge>
          </CardTitle>
          <DisplayedDataExportControls 
            tableData={currentData.map(row => ({
              [views.find(v => v.id === selectedView)?.label.replace('By ', '') || 'Item']: row[currentKey],
              'Total Sessions': formatNumber(row.totalSessions),
              'Total Capacity': formatNumber(row.totalCapacity),
              'Total Attendance': formatNumber(row.totalAttendance),
              'Avg Attendance': formatNumber(row.avgAttendance),
              'Fill Rate': formatPercentage(row.fillRate),
              'Utilization Rate': formatPercentage(row.utilizationRate),
              'Efficiency': formatPercentage(row.efficiency),
              'Format Count': formatNumber(row.formatCount),
              'Empty Sessions': formatNumber(row.emptySessions),
              'Low Attendance Sessions': formatNumber(row.lowAttendanceSessions),
              'Full Sessions': formatNumber(row.fullSessions)
            }))}
            tableHeaders={[
              views.find(v => v.id === selectedView)?.label.replace('By ', '') || 'Item',
              'Total Sessions', 'Total Capacity', 'Total Attendance', 'Avg Attendance',
              'Fill Rate', 'Utilization Rate', 'Efficiency', 'Format Count',
              'Empty Sessions', 'Low Attendance Sessions', 'Full Sessions'
            ]}
            tableName={`Class Attendance Utilization - ${views.find(v => v.id === selectedView)?.label}`}
            filename={`class-attendance-utilization-${selectedView}`}
            variant="secondary"
            className="text-white"
          />
        </div>
        
        {/* View Selector */}
        <div className="flex flex-wrap gap-2 mt-6">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                variant={selectedView === view.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView(view.id)}
                className={`gap-2 text-sm transition-all duration-200 ${
                  selectedView === view.id 
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
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
                    <Activity className="w-4 h-4 text-indigo-600" />
                    {views.find(v => v.id === selectedView)?.label.replace('By ', '')}
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Sessions
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    Avg Attendance
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Fill Rate
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    Utilization
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Performance
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-pink-600" />
                    Session Types
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Status
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row: any, index) => {
                const utilizationBadge = getUtilizationBadge(row.utilizationRate);
                const StatusIcon = utilizationBadge.icon;
                
                return (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{row[currentKey]}</span>
                        <span className="text-xs text-gray-500">
                          {row.formatCount} formats
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatNumber(row.totalSessions)}</span>
                        <span className="text-xs text-gray-500">
                          {formatNumber(row.totalCapacity)} capacity
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatNumber(row.avgAttendance)}</span>
                        <span className="text-xs text-gray-500">
                          per session
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
                      <Badge className={utilizationBadge.color}>
                        {formatPercentage(row.utilizationRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs">{row.fullSessions} full</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs">{row.lowAttendanceSessions} low</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span className="text-xs">{row.emptySessions} empty</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.formatCount}</span>
                        <span className="text-xs text-gray-500">active</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <StatusIcon className="w-5 h-5" />
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