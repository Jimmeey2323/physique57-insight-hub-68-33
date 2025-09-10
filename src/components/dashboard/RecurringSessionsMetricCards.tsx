import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Target, 
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringSessionsMetricCardsProps {
  data: RecurringSessionData[];
}

export const RecurringSessionsMetricCards: React.FC<RecurringSessionsMetricCardsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalSessions = data.length;
  const totalCapacity = data.reduce((sum, session) => sum + session.capacity, 0);
  const totalCheckedIn = data.reduce((sum, session) => sum + session.checkedIn, 0);
  const totalRevenue = data.reduce((sum, session) => sum + session.revenue, 0);
  const avgFillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
  const totalTrainers = new Set(data.map(session => session.trainer)).size;
  const totalClasses = new Set(data.map(session => session.class)).size;
  const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

  const metrics = [
    {
      title: 'Total Sessions',
      value: formatNumber(totalSessions),
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+12.5%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Attendance',
      value: formatNumber(totalCheckedIn),
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: '+8.3%',
      changeType: 'positive' as const
    },
    {
      title: 'Average Fill Rate',
      value: formatPercentage(avgFillRate),
      icon: Target,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: '+5.7%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      change: '+15.2%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Trainers',
      value: formatNumber(totalTrainers),
      icon: Activity,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Class Types',
      value: formatNumber(totalClasses),
      icon: BarChart3,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      change: 'Stable',
      changeType: 'neutral' as const
    },
    {
      title: 'Avg Revenue/Session',
      value: formatCurrency(avgRevenuePerSession),
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      change: '+7.1%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Capacity',
      value: formatNumber(totalCapacity),
      icon: Clock,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      change: '+3.2%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className={`bg-gradient-to-br ${metric.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <Badge 
                className={`text-xs px-2 py-1 ${
                  metric.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {metric.change}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};