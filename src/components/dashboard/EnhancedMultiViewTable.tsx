import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { 
  Table2, Calendar, Users, Target, TrendingUp, Clock, MapPin, BarChart3, 
  ArrowUpDown, TrendingDown, Minus, Filter, ChevronRight 
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface EnhancedMultiViewTableProps {
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

type MetricSelector = 
  | 'attendance'
  | 'revenue'
  | 'fillRate'
  | 'conversion'
  | 'retention'
  | 'cancellation'
  | 'score';

export const EnhancedMultiViewTable: React.FC<EnhancedMultiViewTableProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<GroupingOption>('class');
  const [selectedMetric, setSelectedMetric] = useState<MetricSelector>('attendance');
  const [sortBy, setSortBy] = useState<'name' | 'sessions' | 'metric' | 'trend'>('metric');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [compareMonthOnMonth, setCompareMonthOnMonth] = useState(false);

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

  const metricOptions = [
    { value: 'attendance', label: 'Attendance', icon: Users, color: 'blue' },
    { value: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'green' },
    { value: 'fillRate', label: 'Fill Rate', icon: Target, color: 'purple' },
    { value: 'conversion', label: 'New Client Conversion', icon: TrendingUp, color: 'indigo' },
    { value: 'retention', label: 'Client Retention', icon: Target, color: 'orange' },
    { value: 'cancellation', label: 'Cancellation Rate', icon: TrendingDown, color: 'red' },
    { value: 'score', label: 'Performance Score', icon: BarChart3, color: 'yellow' }
  ];

  const analysisData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get current and previous month data for comparison
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthData = data.filter(session => {
      const sessionDate = new Date(session.date || '');
      return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
    });

    const previousMonthData = data.filter(session => {
      const sessionDate = new Date(session.date || '');
      return sessionDate.getMonth() === previousMonth && sessionDate.getFullYear() === previousYear;
    });

    const processGroup = (dataset: SessionData[], prefix = '') => {
      const grouped = dataset.reduce((acc, session) => {
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
            key = `${session.cleanedClass || session.classType || 'Unknown'} • ${session.trainerName || 'Unknown'}`;
            break;
          case 'classLocation':
            key = `${session.cleanedClass || session.classType || 'Unknown'} • ${session.location || 'Unknown'}`;
            break;
          case 'trainerLocation':
            key = `${session.trainerName || 'Unknown'} • ${session.location || 'Unknown'}`;
            break;
          case 'dayTime':
            key = `${session.dayOfWeek || 'Unknown'} • ${session.time || 'Unknown'}`;
            break;
          case 'classDay':
            key = `${session.cleanedClass || session.classType || 'Unknown'} • ${session.dayOfWeek || 'Unknown'}`;
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
            totalCancelled: 0,
            totalNew: 0,
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
        acc[key].totalCancelled += session.lateCancelledCount || 0;
        acc[key].totalNew += (session as any).newClientCount || 0;
        
        if (session.trainerName) acc[key].uniqueTrainers.add(session.trainerName);
        if (session.cleanedClass || session.classType) acc[key].uniqueClasses.add(session.cleanedClass || session.classType || '');
        if (session.location) acc[key].uniqueLocations.add(session.location);
        acc[key].sessions.push(session);

        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => {
        const avgAttendance = item.totalSessions > 0 ? Math.round(item.totalAttendance / item.totalSessions) : 0;
        const avgRevenue = item.totalSessions > 0 ? Math.round(item.totalRevenue / item.totalSessions) : 0;
        const fillRate = item.totalCapacity > 0 ? Math.round((item.totalAttendance / item.totalCapacity) * 100) : 0;
        const conversionRate = item.totalAttendance > 0 ? Math.round((item.totalNew / item.totalAttendance) * 100) : 0;
        const retentionRate = item.totalAttendance > 0 ? Math.round(((item.totalAttendance - item.totalNew) / item.totalAttendance) * 100) : 0;
        const cancellationRate = item.totalBooked > 0 ? Math.round((item.totalCancelled / item.totalBooked) * 100) : 0;
        const score = Math.round((fillRate * 0.3 + (100 - cancellationRate) * 0.25 + retentionRate * 0.25 + conversionRate * 0.2));

        return {
          name: item.name,
          totalSessions: item.totalSessions,
          avgAttendance,
          totalAttendance: item.totalAttendance,
          avgRevenue,
          totalRevenue: item.totalRevenue,
          fillRate,
          conversionRate,
          retentionRate,
          cancellationRate,
          score,
          uniqueTrainers: item.uniqueTrainers.size,
          uniqueClasses: item.uniqueClasses.size,
          uniqueLocations: item.uniqueLocations.size,
          sessions: item.sessions
        };
      });
    };

    const currentData = processGroup(compareMonthOnMonth ? currentMonthData : data);
    
    if (compareMonthOnMonth) {
      const previousData = processGroup(previousMonthData);
      const previousMap = new Map(previousData.map(item => [item.name, item]));

      return currentData.map(current => {
        const previous = previousMap.get(current.name);
        
        const calculateTrend = (currentVal: number, previousVal: number) => {
          if (previousVal === 0) return currentVal > 0 ? 100 : 0;
          return Math.round(((currentVal - previousVal) / previousVal) * 100);
        };

        let trend = 0;
        let previousValue = 0;
        let currentValue = 0;

        switch (selectedMetric) {
          case 'attendance':
            currentValue = current.avgAttendance;
            previousValue = previous?.avgAttendance || 0;
            break;
          case 'revenue':
            currentValue = current.avgRevenue;
            previousValue = previous?.avgRevenue || 0;
            break;
          case 'fillRate':
            currentValue = current.fillRate;
            previousValue = previous?.fillRate || 0;
            break;
          case 'conversion':
            currentValue = current.conversionRate;
            previousValue = previous?.conversionRate || 0;
            break;
          case 'retention':
            currentValue = current.retentionRate;
            previousValue = previous?.retentionRate || 0;
            break;
          case 'cancellation':
            currentValue = current.cancellationRate;
            previousValue = previous?.cancellationRate || 0;
            break;
          case 'score':
            currentValue = current.score;
            previousValue = previous?.score || 0;
            break;
        }

        trend = calculateTrend(currentValue, previousValue);

        return {
          ...current,
          trend,
          previousValue,
          hasComparison: !!previous
        };
      });
    }

    return currentData;
  }, [data, groupBy, selectedMetric, compareMonthOnMonth]);

  const sortedData = useMemo(() => {
    return [...analysisData].sort((a, b) => {
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
        case 'trend':
          aValue = (a as any).trend || 0;
          bValue = (b as any).trend || 0;
          break;
        case 'metric':
          switch (selectedMetric) {
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
            case 'conversion':
              aValue = a.conversionRate;
              bValue = b.conversionRate;
              break;
            case 'retention':
              aValue = a.retentionRate;
              bValue = b.retentionRate;
              break;
            case 'cancellation':
              aValue = a.cancellationRate;
              bValue = b.cancellationRate;
              break;
            case 'score':
              aValue = a.score;
              bValue = b.score;
              break;
          }
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
  }, [analysisData, sortBy, sortOrder, selectedMetric]);

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'attendance': return item.avgAttendance;
      case 'revenue': return item.avgRevenue;
      case 'fillRate': return item.fillRate;
      case 'conversion': return item.conversionRate;
      case 'retention': return item.retentionRate;
      case 'cancellation': return item.cancellationRate;
      case 'score': return item.score;
      default: return 0;
    }
  };

  const formatMetricValue = (value: number) => {
    switch (selectedMetric) {
      case 'revenue':
        return `₹${value.toLocaleString()}`;
      case 'fillRate':
      case 'conversion':
      case 'retention':
      case 'cancellation':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const columns = [
    {
      key: 'name' as const,
      header: groupingOptions.find(o => o.value === groupBy)?.label.replace('By ', '') || 'Name',
      render: (value: string) => (
        <div className="font-medium text-slate-800 max-w-xs">
          <div className="truncate" title={value}>{value}</div>
        </div>
      ),
      className: 'min-w-[200px]'
    },
    {
      key: 'totalSessions' as const,
      header: 'Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'metric' as const,
      header: metricOptions.find(m => m.value === selectedMetric)?.label || 'Metric',
      align: 'center' as const,
      render: (_: any, item: any) => {
        const value = getMetricValue(item);
        const metricConfig = metricOptions.find(m => m.value === selectedMetric);
        return (
          <div className={`font-semibold text-${metricConfig?.color}-600`}>
            {formatMetricValue(value)}
          </div>
        );
      }
    },
    ...(compareMonthOnMonth ? [{
      key: 'trend' as const,
      header: 'MoM Change',
      align: 'center' as const,
      render: (_: any, item: any) => {
        const trend = item.trend || 0;
        const hasComparison = item.hasComparison;
        
        if (!hasComparison) {
          return <Badge variant="outline">New</Badge>;
        }

        return (
          <div className="flex items-center justify-center gap-1">
            {trend > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="font-medium text-green-600">+{trend}%</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="font-medium text-red-600">{trend}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 text-gray-500" />
                <span className="font-medium text-gray-600">0%</span>
              </>
            )}
          </div>
        );
      }
    }] : []),
    {
      key: 'fillRate' as const,
      header: 'Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'outline'}>
          {value}%
        </Badge>
      )
    },
    {
      key: 'score' as const,
      header: 'Score',
      align: 'center' as const,
      render: (value: number) => (
        <div className={`font-bold ${value >= 80 ? 'text-yellow-600' : value >= 60 ? 'text-blue-600' : 'text-slate-500'}`}>
          {value}
        </div>
      )
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Table2 className="w-6 h-6 text-green-600" />
            Enhanced Multi-View Analytics
          </CardTitle>
          <div className="flex flex-wrap gap-2">
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
            
            <Select value={selectedMetric} onValueChange={(value: MetricSelector) => setSelectedMetric(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={compareMonthOnMonth ? "default" : "outline"}
              size="sm"
              onClick={() => setCompareMonthOnMonth(!compareMonthOnMonth)}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              MoM Compare
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline" className="text-slate-600">
            Showing {sortedData.length} entries • {metricOptions.find(m => m.value === selectedMetric)?.label} analysis
          </Badge>
          {compareMonthOnMonth && (
            <Badge variant="secondary" className="text-blue-600">
              Month-on-Month comparison enabled
            </Badge>
          )}
        </div>

        <OptimizedTable
          data={sortedData}
          columns={columns}
          maxHeight="700px"
          stickyHeader={true}
        />

        {sortedData.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Table2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available for analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};