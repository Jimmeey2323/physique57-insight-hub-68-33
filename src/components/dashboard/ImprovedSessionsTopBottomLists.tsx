
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Percent, ChevronDown } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ImprovedSessionsTopBottomListsProps {
  data: SessionData[];
  title: string;
  type: 'classes' | 'trainers';
  variant: 'top' | 'bottom';
  initialCount?: number;
}

type MetricType = 'attendance' | 'fillRate' | 'revenue' | 'classAverage';

export const ImprovedSessionsTopBottomLists: React.FC<ImprovedSessionsTopBottomListsProps> = ({
  data,
  title,
  type,
  variant,
  initialCount = 10
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('classAverage');
  const [showCount, setShowCount] = useState(initialCount);
  const [viewType, setViewType] = useState<'classes' | 'trainers'>(type);
  const [includeTrainer, setIncludeTrainer] = useState(false);

  const processedData = useMemo(() => {
    const grouped: Record<string, {
      name: string;
      cleanedClass: string;
      dayOfWeek: string;
      time: string;
      location: string;
      trainerName: string;
      totalAttendance: number;
      avgFillRate: number;
      totalRevenue: number;
      sessions: number;
      classAverage: number;
    }> = {};

    data.forEach(session => {
      let key: string;
      
      if (viewType === 'classes') {
        // For classes view, the includeTrainer toggle determines grouping
        if (includeTrainer) {
          key = `${session.cleanedClass}|${session.dayOfWeek}|${session.time}|${session.location}|${session.trainerName}`;
        } else {
          key = `${session.cleanedClass}|${session.dayOfWeek}|${session.time}|${session.location}`;
        }
      } else {
        // For trainers view, always group by trainer
        key = session.trainerName;
      }
      
      if (!key) return;

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          cleanedClass: session.cleanedClass || '',
          dayOfWeek: session.dayOfWeek || '',
          time: session.time || '',
          location: session.location || '',
          trainerName: session.trainerName || '',
          totalAttendance: 0,
          avgFillRate: 0,
          totalRevenue: 0,
          sessions: 0,
          classAverage: 0
        };
      }

      grouped[key].totalAttendance += session.checkedInCount;
      grouped[key].totalRevenue += session.totalPaid;
      grouped[key].sessions += 1;
    });

    // Calculate averages
    Object.values(grouped).forEach(item => {
      const relatedSessions = data.filter(s => {
        if (viewType === 'classes') {
          if (includeTrainer) {
            return s.cleanedClass === item.cleanedClass && 
                   s.dayOfWeek === item.dayOfWeek && 
                   s.time === item.time && 
                   s.location === item.location &&
                   s.trainerName === item.trainerName;
          } else {
            return s.cleanedClass === item.cleanedClass && 
                   s.dayOfWeek === item.dayOfWeek && 
                   s.time === item.time && 
                   s.location === item.location;
          }
        } else {
          return s.trainerName === item.trainerName;
        }
      });
      
      const totalCapacity = relatedSessions.reduce((sum, s) => sum + s.capacity, 0);
      item.avgFillRate = totalCapacity > 0 ? (item.totalAttendance / totalCapacity) * 100 : 0;
      item.classAverage = item.sessions > 0 ? item.totalAttendance / item.sessions : 0;
    });

    // Filter out rows with less than 2 sessions or classes containing "Hosted"
    const filteredData = Object.values(grouped).filter(item => {
      if (item.sessions < 2) return false;
      if (item.cleanedClass && item.cleanedClass.toLowerCase().includes('hosted')) return false;
      return true;
    });

    const sortedData = filteredData.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (selectedMetric) {
        case 'attendance':
          aValue = a.totalAttendance;
          bValue = b.totalAttendance;
          break;
        case 'fillRate':
          aValue = a.avgFillRate;
          bValue = b.avgFillRate;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'classAverage':
        default:
          aValue = a.classAverage;
          bValue = b.classAverage;
          break;
      }
      
      return variant === 'top' ? bValue - aValue : aValue - bValue;
    });

    return sortedData;
  }, [data, viewType, includeTrainer, selectedMetric, variant]);

  const displayData = processedData.slice(0, showCount);
  const hasMore = processedData.length > showCount;

  const metricOptions = [
    { value: 'classAverage', label: 'Class Average', icon: Target },
    { value: 'attendance', label: 'Total Attendance', icon: Users },
    { value: 'fillRate', label: 'Fill Rate %', icon: Percent },
    { value: 'revenue', label: 'Revenue', icon: DollarSign }
  ];

  const getMetricValue = (item: typeof processedData[0]) => {
    switch (selectedMetric) {
      case 'attendance':
        return formatNumber(item.totalAttendance);
      case 'fillRate':
        return `${item.avgFillRate.toFixed(1)}%`;
      case 'revenue':
        return formatCurrency(item.totalRevenue);
      case 'classAverage':
      default:
        return item.classAverage.toFixed(1);
    }
  };

  const getDisplayName = (item: typeof processedData[0]) => {
    if (viewType === 'classes') {
      if (includeTrainer) {
        return `${item.cleanedClass} - ${item.dayOfWeek} ${item.time} (${item.trainerName})`;
      } else {
        return `${item.cleanedClass} - ${item.dayOfWeek} ${item.time}`;
      }
    } else {
      return item.trainerName;
    }
  };

  const getRankColor = (index: number) => {
    if (variant === 'top') {
      if (index === 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (index === 1) return 'bg-gray-100 text-gray-800 border-gray-200';
      if (index === 2) return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else {
      return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {variant === 'top' ? 
              <TrendingUp className="w-5 h-5 text-green-600" /> : 
              <TrendingDown className="w-5 h-5 text-red-600" />
            }
            {title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {metricOptions.find(opt => opt.value === selectedMetric)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white shadow-lg border z-50" align="end">
              {metricOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedMetric(option.value as MetricType)}
                  className="cursor-pointer"
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Toggle between Classes and Trainers */}
        <div className="flex justify-center mb-4">
          <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value as 'classes' | 'trainers')}>
            <ToggleGroupItem value="classes" aria-label="Classes view">
              Classes
            </ToggleGroupItem>
            <ToggleGroupItem value="trainers" aria-label="Trainers view">
              Trainers
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Include Trainer Toggle - only show for classes view */}
        {viewType === 'classes' && (
          <div className="flex justify-center">
            <ToggleGroup type="single" value={includeTrainer ? 'with-trainer' : 'without-trainer'} onValueChange={(value) => setIncludeTrainer(value === 'with-trainer')}>
              <ToggleGroupItem value="without-trainer" aria-label="Group without trainer">
                Group by Class
              </ToggleGroupItem>
              <ToggleGroupItem value="with-trainer" aria-label="Group with trainer">
                Include Trainer
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1 min-h-[600px] overflow-y-auto">
          {displayData.map((item, index) => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankColor(index)}`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {getDisplayName(item)}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {viewType === 'classes' && (
                      <>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                          {item.location}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                          {item.sessions} sessions
                        </Badge>
                      </>
                    )}
                    {viewType === 'trainers' && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200">
                        {item.sessions} classes taught
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedMetric === 'attendance' && `${item.sessions} sessions`}
                    {selectedMetric === 'fillRate' && `${formatNumber(item.totalAttendance)} attendees`}
                    {selectedMetric === 'revenue' && `Avg: ${formatCurrency(item.totalRevenue / item.sessions)}`}
                    {selectedMetric === 'classAverage' && `${formatNumber(item.totalAttendance)} total attendees`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {getMetricValue(item)}
                </div>
                <Badge 
                  variant={variant === 'top' ? 'default' : 'destructive'} 
                  className="text-xs"
                >
                  {variant === 'top' ? 'High Performer' : 'Needs Focus'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCount(showCount + 10)}
              className="w-full"
            >
              Show More ({processedData.length - showCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
