import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Target, 
  DollarSign,
  Clock,
  BarChart3,
  Zap,
  Dumbbell,
  Flame
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { PayrollData } from '@/types/dashboard';

interface PowerCycleBarreStrengthMetricCardsProps {
  data: PayrollData[];
}

export const PowerCycleBarreStrengthMetricCards: React.FC<PowerCycleBarreStrengthMetricCardsProps> = ({ data }) => {
  console.log('PowerCycleBarreStrengthMetricCards received data:', data?.length, 'items');
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        powerCycle: { sessions: 0, customers: 0, revenue: 0, avgFillRate: 0, emptySessions: 0 },
        barre: { sessions: 0, customers: 0, revenue: 0, avgFillRate: 0, emptySessions: 0 },
        strength: { sessions: 0, customers: 0, revenue: 0, avgFillRate: 0, emptySessions: 0 },
        totals: { sessions: 0, customers: 0, revenue: 0, avgFillRate: 0, emptySessions: 0 }
      };
    }

    // Calculate PowerCycle metrics
    const powerCycleMetrics = {
      sessions: data.reduce((sum, item) => sum + (item.cycleSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.cycleCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.cyclePaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyCycleSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyCycleSessions || 0), 0),
      avgFillRate: 0
    };

    // Calculate Barre metrics
    const barreMetrics = {
      sessions: data.reduce((sum, item) => sum + (item.barreSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.barreCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.barrePaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyBarreSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyBarreSessions || 0), 0),
      avgFillRate: 0
    };

    // Calculate Strength metrics
    const strengthMetrics = {
      sessions: data.reduce((sum, item) => sum + (item.strengthSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.strengthCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.strengthPaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyStrengthSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyStrengthSessions || 0), 0),
      avgFillRate: 0
    };

    // Calculate totals
    const totals = {
      sessions: data.reduce((sum, item) => sum + (item.totalSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.totalCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.totalPaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.totalEmptySessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.totalNonEmptySessions || 0), 0),
      avgFillRate: 0
    };

    // Calculate fill rates
    powerCycleMetrics.avgFillRate = powerCycleMetrics.nonEmptySessions > 0 ? 
      (powerCycleMetrics.customers / powerCycleMetrics.nonEmptySessions) : 0;
    barreMetrics.avgFillRate = barreMetrics.nonEmptySessions > 0 ? 
      (barreMetrics.customers / barreMetrics.nonEmptySessions) : 0;
    strengthMetrics.avgFillRate = strengthMetrics.nonEmptySessions > 0 ? 
      (strengthMetrics.customers / strengthMetrics.nonEmptySessions) : 0;
    totals.avgFillRate = totals.nonEmptySessions > 0 ? 
      (totals.customers / totals.nonEmptySessions) : 0;

    return {
      powerCycle: powerCycleMetrics,
      barre: barreMetrics,
      strength: strengthMetrics,
      totals
    };
  }, [data]);

  const metricCards = [
    {
      title: 'PowerCycle Sessions',
      value: formatNumber(metrics.powerCycle.sessions),
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-100',
      change: '+12.5%',
      changeType: 'positive' as const,
      subtitle: `${formatNumber(metrics.powerCycle.customers)} customers • ${formatCurrency(metrics.powerCycle.revenue)} revenue`
    },
    {
      title: 'Barre Sessions',
      value: formatNumber(metrics.barre.sessions),
      icon: Activity,
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-100',
      change: '+8.3%',
      changeType: 'positive' as const,
      subtitle: `${formatNumber(metrics.barre.customers)} customers • ${formatCurrency(metrics.barre.revenue)} revenue`
    },
    {
      title: 'Strength Sessions',
      value: formatNumber(metrics.strength.sessions),
      icon: Dumbbell,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-100',
      change: '+15.2%',
      changeType: 'positive' as const,
      subtitle: `${formatNumber(metrics.strength.customers)} customers • ${formatCurrency(metrics.strength.revenue)} revenue`
    },
    {
      title: 'Total Sessions',
      value: formatNumber(metrics.totals.sessions),
      icon: Calendar,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100',
      change: '+11.8%',
      changeType: 'positive' as const,
      subtitle: `${formatNumber(metrics.totals.customers)} total customers • ${formatCurrency(metrics.totals.revenue)} total revenue`
    },
    {
      title: 'PowerCycle Revenue',
      value: formatCurrency(metrics.powerCycle.revenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      change: '+18.7%',
      changeType: 'positive' as const,
      subtitle: `Avg: ${metrics.powerCycle.sessions > 0 ? formatCurrency(metrics.powerCycle.revenue / metrics.powerCycle.sessions) : '₹0'} per session`
    },
    {
      title: 'Barre Revenue',
      value: formatCurrency(metrics.barre.revenue),
      icon: DollarSign,
      gradient: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 to-cyan-100',
      change: '+14.2%',
      changeType: 'positive' as const,
      subtitle: `Avg: ${metrics.barre.sessions > 0 ? formatCurrency(metrics.barre.revenue / metrics.barre.sessions) : '₹0'} per session`
    },
    {
      title: 'Strength Revenue',
      value: formatCurrency(metrics.strength.revenue),
      icon: DollarSign,
      gradient: 'from-amber-500 to-yellow-600',
      bgGradient: 'from-amber-50 to-yellow-100',
      change: '+22.1%',
      changeType: 'positive' as const,
      subtitle: `Avg: ${metrics.strength.sessions > 0 ? formatCurrency(metrics.strength.revenue / metrics.strength.sessions) : '₹0'} per session`
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totals.revenue),
      icon: Target,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-100',
      change: '+16.8%',
      changeType: 'positive' as const,
      subtitle: `Avg: ${metrics.totals.sessions > 0 ? formatCurrency(metrics.totals.revenue / metrics.totals.sessions) : '₹0'} per session`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
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
              <p className="text-xs text-gray-500">{metric.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};