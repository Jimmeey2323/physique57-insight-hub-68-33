import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringSessionsTopBottomListsProps {
  data: RecurringSessionData[];
  title: string;
  type: 'classes' | 'trainers';
  variant: 'top' | 'bottom';
}

export const RecurringSessionsTopBottomLists: React.FC<RecurringSessionsTopBottomListsProps> = ({ 
  data, 
  title, 
  type, 
  variant 
}) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const groups: Record<string, {
      name: string;
      totalSessions: number;
      totalAttendance: number;
      totalRevenue: number;
      avgFillRate: number;
      totalCapacity: number;
    }> = {};

    const groupKey = type === 'classes' ? 'class' : 'trainer';

    data.forEach(session => {
      const key = session[groupKey] || 'Unknown';
      
      if (!groups[key]) {
        groups[key] = {
          name: key,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          avgFillRate: 0,
          totalCapacity: 0
        };
      }

      groups[key].totalSessions += 1;
      groups[key].totalAttendance += session.checkedIn;
      groups[key].totalRevenue += session.revenue;
      groups[key].totalCapacity += session.capacity;
    });

    // Calculate fill rates and sort
    const processed = Object.values(groups)
      .map(group => ({
        ...group,
        avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0
      }))
      .sort((a, b) => {
        // Sort by fill rate for performance, by revenue for revenue analysis
        const sortValue = variant === 'top' ? 'avgFillRate' : 'avgFillRate';
        return variant === 'top' ? b[sortValue] - a[sortValue] : a[sortValue] - b[sortValue];
      })
      .slice(0, 10);

    return processed;
  }, [data, type, variant]);

  const getIcon = () => {
    if (variant === 'top') {
      return type === 'classes' ? Award : TrendingUp;
    } else {
      return type === 'classes' ? AlertTriangle : TrendingDown;
    }
  };

  const getGradient = () => {
    if (variant === 'top') {
      return type === 'classes' 
        ? 'from-green-500 to-emerald-600' 
        : 'from-blue-500 to-indigo-600';
    } else {
      return type === 'classes' 
        ? 'from-orange-500 to-red-600' 
        : 'from-purple-500 to-pink-600';
    }
  };

  const Icon = getIcon();

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden h-full">
      <CardHeader className={`bg-gradient-to-r ${getGradient()} text-white`}>
        <CardTitle className="flex items-center gap-3 text-lg font-bold">
          <Icon className="w-5 h-5" />
          {title}
          <Badge className="bg-white/20 text-white border-white/30">
            {processedData.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {processedData.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No data available for {title.toLowerCase()}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {processedData.map((item, index) => (
                <div
                  key={item.name}
                  className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${
                    index === 0 
                      ? variant === 'top' ? 'border-l-green-500 bg-green-50/50' : 'border-l-red-500 bg-red-50/50'
                      : index === 1
                      ? variant === 'top' ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-orange-500 bg-orange-50/50'
                      : index === 2
                      ? variant === 'top' ? 'border-l-purple-500 bg-purple-50/50' : 'border-l-yellow-500 bg-yellow-50/50'
                      : 'border-l-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                        index === 0 
                          ? variant === 'top' ? 'bg-green-500' : 'bg-red-500'
                          : index === 1
                          ? variant === 'top' ? 'bg-blue-500' : 'bg-orange-500'
                          : index === 2
                          ? variant === 'top' ? 'bg-purple-500' : 'bg-yellow-500'
                          : 'bg-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="w-3 h-3" />
                            {formatNumber(item.totalSessions)} sessions
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Users className="w-3 h-3" />
                            {formatNumber(item.totalAttendance)} attendees
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className={`text-lg font-bold ${
                          item.avgFillRate >= 80 
                            ? 'text-green-600' 
                            : item.avgFillRate >= 60 
                            ? 'text-blue-600' 
                            : item.avgFillRate >= 40 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {formatPercentage(item.avgFillRate)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatCurrency(item.totalRevenue)} revenue
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};