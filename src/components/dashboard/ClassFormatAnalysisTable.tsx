import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table2, Calendar, Users, Target, TrendingUp, Clock, MapPin, BarChart3, ArrowUpDown } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';

interface ClassFormatAnalysisTableProps {
  data: SessionData[];
}

type GroupingOption = 
  | 'class'
  | 'trainer' 
  | 'location' 
  | 'day' 
  | 'time' 
  | 'classTrainer' 
  | 'classLocation' 
  | 'trainerLocation'
  | 'dayTime'
  | 'classDay';

export const ClassFormatAnalysisTable: React.FC<ClassFormatAnalysisTableProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<GroupingOption>('class');
  const [sortBy, setSortBy] = useState<'name' | 'sessions' | 'attendance' | 'revenue' | 'fillRate'>('attendance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const groupingOptions = [
    { value: 'class', label: 'By Class Format', icon: BarChart3 },
    { value: 'trainer', label: 'By Trainer', icon: Users },
    { value: 'location', label: 'By Location', icon: MapPin },
    { value: 'day', label: 'By Day of Week', icon: Calendar },
    { value: 'time', label: 'By Time Slot', icon: Clock },
    { value: 'classTrainer', label: 'Class + Trainer', icon: Target },
    { value: 'classLocation', label: 'Class + Location', icon: Target },
    { value: 'trainerLocation', label: 'Trainer + Location', icon: Target },
    { value: 'dayTime', label: 'Day + Time', icon: Target },
    { value: 'classDay', label: 'Class + Day', icon: Target }
  ];

  const analysisData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped = data.reduce((acc, session) => {
      let key: string;

      switch (groupBy) {
        case 'class':
          key = session.cleanedClass || session.classType || 'Unknown';
          break;
        case 'trainer':
          key = session.trainerName || 'Unknown';
          break;
        case 'location':
          key = session.location || 'Unknown';
          break;
        case 'day':
          key = session.dayOfWeek || 'Unknown';
          break;
        case 'time':
          key = session.time || 'Unknown';
          break;
        case 'classTrainer':
          key = `${session.cleanedClass || session.classType || 'Unknown'} - ${session.trainerName || 'Unknown'}`;
          break;
        case 'classLocation':
          key = `${session.cleanedClass || session.classType || 'Unknown'} - ${session.location || 'Unknown'}`;
          break;
        case 'trainerLocation':
          key = `${session.trainerName || 'Unknown'} - ${session.location || 'Unknown'}`;
          break;
        case 'dayTime':
          key = `${session.dayOfWeek || 'Unknown'} - ${session.time || 'Unknown'}`;
          break;
        case 'classDay':
          key = `${session.cleanedClass || session.classType || 'Unknown'} - ${session.dayOfWeek || 'Unknown'}`;
          break;
        default:
          key = 'Unknown';
      }

      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          totalBooked: 0,
          totalLateCancelled: 0,
          uniqueTrainers: new Set<string>(),
          uniqueClasses: new Set<string>(),
          uniqueLocations: new Set<string>(),
          sessions: []
        };
      }

      acc[key].totalSessions += 1;
      acc[key].totalAttendance += session.checkedInCount || 0;
      acc[key].totalCapacity += session.capacity || 0;
      acc[key].totalRevenue += session.totalPaid || 0;
      acc[key].totalBooked += session.bookedCount || 0;
      acc[key].totalLateCancelled += session.lateCancelledCount || 0;
      
      if (session.trainerName) acc[key].uniqueTrainers.add(session.trainerName);
      if (session.cleanedClass || session.classType) acc[key].uniqueClasses.add(session.cleanedClass || session.classType || '');
      if (session.location) acc[key].uniqueLocations.add(session.location);
      acc[key].sessions.push(session);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      name: item.name,
      totalSessions: item.totalSessions,
      avgAttendance: Math.round(item.totalAttendance / item.totalSessions),
      totalAttendance: item.totalAttendance,
      fillRate: Math.round((item.totalAttendance / item.totalCapacity) * 100),
      avgRevenue: Math.round(item.totalRevenue / item.totalSessions),
      totalRevenue: item.totalRevenue,
      bookingRate: Math.round((item.totalBooked / item.totalCapacity) * 100),
      cancellationRate: Math.round((item.totalLateCancelled / item.totalBooked) * 100) || 0,
      uniqueTrainers: item.uniqueTrainers.size,
      uniqueClasses: item.uniqueClasses.size,
      uniqueLocations: item.uniqueLocations.size,
      sessions: item.sessions
    })).sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sessions':
          aValue = a.totalSessions;
          bValue = b.totalSessions;
          break;
        case 'attendance':
          aValue = a.avgAttendance;
          bValue = b.avgAttendance;
          break;
        case 'revenue':
          aValue = a.avgRevenue;
          bValue = b.avgRevenue;
          break;
        case 'fillRate':
          aValue = a.fillRate;
          bValue = b.fillRate;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, groupBy, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Table2 className="w-6 h-6 text-green-600" />
            Multi-View Analysis Table
          </CardTitle>
          <div className="flex gap-2">
            <DisplayedDataExportControls 
              tableData={analysisData.map(row => ({
                [groupingOptions.find(o => o.value === groupBy)?.label.replace('By ', '') || 'Item']: row.name,
                'Total Sessions': formatNumber(row.totalSessions),
                'Avg Attendance': formatNumber(row.avgAttendance),
                'Total Attendance': formatNumber(row.totalAttendance),
                'Fill Rate': formatPercentage(row.fillRate),
                'Avg Revenue': formatCurrency(row.avgRevenue),
                'Total Revenue': formatCurrency(row.totalRevenue),
                'Booking Rate': formatPercentage(row.bookingRate),
                'Cancellation Rate': formatPercentage(row.cancellationRate),
                'Unique Trainers': formatNumber(row.uniqueTrainers),
                'Unique Classes': formatNumber(row.uniqueClasses),
                'Unique Locations': formatNumber(row.uniqueLocations)
              }))}
              tableHeaders={[
                groupingOptions.find(o => o.value === groupBy)?.label.replace('By ', '') || 'Item',
                'Total Sessions', 'Avg Attendance', 'Total Attendance', 'Fill Rate',
                'Avg Revenue', 'Total Revenue', 'Booking Rate', 'Cancellation Rate',
                'Unique Trainers', 'Unique Classes', 'Unique Locations'
              ]}
              tableName={`Class Format Analysis - ${groupingOptions.find(o => o.value === groupBy)?.label}`}
              filename={`class-format-analysis-${groupBy}`}
              size="sm"
            />
            <Select value={groupBy} onValueChange={(value: GroupingOption) => setGroupBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge variant="outline" className="text-slate-600">
            Showing {analysisData.length} entries grouped by {groupingOptions.find(o => o.value === groupBy)?.label}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    {groupingOptions.find(o => o.value === groupBy)?.label.replace('By ', '')}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort('sessions')}>
                  <div className="flex items-center justify-center gap-1">
                    Sessions
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort('attendance')}>
                  <div className="flex items-center justify-center gap-1">
                    Avg Attendance
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 font-semibold text-slate-700">Total Attendance</th>
                <th className="text-center py-3 font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort('fillRate')}>
                  <div className="flex items-center justify-center gap-1">
                    Fill Rate
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right py-3 font-semibold text-slate-700 cursor-pointer" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1">
                    Avg Revenue
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 font-semibold text-slate-700">Booking Rate</th>
                <th className="text-center py-3 font-semibold text-slate-700">Cancellation Rate</th>
                {(groupBy !== 'trainer' && groupBy !== 'trainerLocation') && (
                  <th className="text-center py-3 font-semibold text-slate-700">Trainers</th>
                )}
                {(groupBy !== 'class' && groupBy !== 'classTrainer' && groupBy !== 'classLocation' && groupBy !== 'classDay') && (
                  <th className="text-center py-3 font-semibold text-slate-700">Classes</th>
                )}
                {(groupBy !== 'location' && groupBy !== 'classLocation' && groupBy !== 'trainerLocation') && (
                  <th className="text-center py-3 font-semibold text-slate-700">Locations</th>
                )}
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 font-medium text-slate-800 max-w-xs">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                  </td>
                  <td className="text-center py-4 text-slate-700">{item.totalSessions}</td>
                  <td className="text-center py-4">
                    <span className="font-semibold text-blue-600">{item.avgAttendance}</span>
                  </td>
                  <td className="text-center py-4 text-slate-700">{item.totalAttendance.toLocaleString()}</td>
                  <td className="text-center py-4">
                    <Badge variant={
                      item.fillRate >= 80 ? 'default' :
                      item.fillRate >= 60 ? 'secondary' : 'outline'
                    }>
                      {item.fillRate}%
                    </Badge>
                  </td>
                  <td className="text-right py-4 font-semibold text-green-600">
                    ₹{item.avgRevenue.toLocaleString()}
                  </td>
                  <td className="text-center py-4">
                    <Badge variant="outline" className="text-slate-600">
                      {item.bookingRate}%
                    </Badge>
                  </td>
                  <td className="text-center py-4">
                    <Badge variant={
                      item.cancellationRate <= 10 ? 'default' :
                      item.cancellationRate <= 20 ? 'secondary' : 'outline'
                    }>
                      {item.cancellationRate}%
                    </Badge>
                  </td>
                  {(groupBy !== 'trainer' && groupBy !== 'trainerLocation') && (
                    <td className="text-center py-4 text-slate-600">{item.uniqueTrainers}</td>
                  )}
                  {(groupBy !== 'class' && groupBy !== 'classTrainer' && groupBy !== 'classLocation' && groupBy !== 'classDay') && (
                    <td className="text-center py-4 text-slate-600">{item.uniqueClasses}</td>
                  )}
                  {(groupBy !== 'location' && groupBy !== 'classLocation' && groupBy !== 'trainerLocation') && (
                    <td className="text-center py-4 text-slate-600">{item.uniqueLocations}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analysisData.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Table2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available for analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};