import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { 
  Zap, 
  Dumbbell, 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  UserCheck,
  UserPlus
} from 'lucide-react';

interface PowerCycleBarreStrengthComprehensiveMetricsProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
}

export const PowerCycleBarreStrengthComprehensiveMetrics: React.FC<PowerCycleBarreStrengthComprehensiveMetricsProps> = ({
  data,
  onItemClick
}) => {
  const metrics = useMemo(() => {
    if (!data.length) return null;

    // PowerCycle Metrics
    const powerCycleData = {
      totalSessions: data.reduce((sum, item) => sum + (item.cycleSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyCycleSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyCycleSessions || 0), 0),
      totalCustomers: data.reduce((sum, item) => sum + (item.cycleCustomers || 0), 0),
      totalRevenue: data.reduce((sum, item) => sum + (item.cyclePaid || 0), 0),
    };

    // Barre Metrics
    const barreData = {
      totalSessions: data.reduce((sum, item) => sum + (item.barreSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyBarreSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyBarreSessions || 0), 0),
      totalCustomers: data.reduce((sum, item) => sum + (item.barreCustomers || 0), 0),
      totalRevenue: data.reduce((sum, item) => sum + (item.barrePaid || 0), 0),
    };

    // Strength Metrics
    const strengthData = {
      totalSessions: data.reduce((sum, item) => sum + (item.strengthSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyStrengthSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyStrengthSessions || 0), 0),
      totalCustomers: data.reduce((sum, item) => sum + (item.strengthCustomers || 0), 0),
      totalRevenue: data.reduce((sum, item) => sum + (item.strengthPaid || 0), 0),
    };

    // Overall Metrics
    const totalSessions = powerCycleData.totalSessions + barreData.totalSessions + strengthData.totalSessions;
    const totalRevenue = powerCycleData.totalRevenue + barreData.totalRevenue + strengthData.totalRevenue;
    const totalCustomers = powerCycleData.totalCustomers + barreData.totalCustomers + strengthData.totalCustomers;
    const totalEmpty = powerCycleData.emptySessions + barreData.emptySessions + strengthData.emptySessions;
    const totalNew = data.reduce((sum, item) => sum + (item.new || 0), 0);
    const totalConverted = data.reduce((sum, item) => sum + (item.converted || 0), 0);
    const totalRetained = data.reduce((sum, item) => sum + (item.retained || 0), 0);

    // Calculate fill rates
    const powerCycleFillRate = powerCycleData.totalSessions > 0 ? 
      ((powerCycleData.totalSessions - powerCycleData.emptySessions) / powerCycleData.totalSessions) * 100 : 0;
    const barreFillRate = barreData.totalSessions > 0 ? 
      ((barreData.totalSessions - barreData.emptySessions) / barreData.totalSessions) * 100 : 0;
    const strengthFillRate = strengthData.totalSessions > 0 ? 
      ((strengthData.totalSessions - strengthData.emptySessions) / strengthData.totalSessions) * 100 : 0;

    // Calculate averages
    const powerCycleAvgCustomers = powerCycleData.nonEmptySessions > 0 ? 
      powerCycleData.totalCustomers / powerCycleData.nonEmptySessions : 0;
    const barreAvgCustomers = barreData.nonEmptySessions > 0 ? 
      barreData.totalCustomers / barreData.nonEmptySessions : 0;
    const strengthAvgCustomers = strengthData.nonEmptySessions > 0 ? 
      strengthData.totalCustomers / strengthData.nonEmptySessions : 0;

    return {
      powerCycle: powerCycleData,
      barre: barreData,
      strength: strengthData,
      totals: {
        sessions: totalSessions,
        revenue: totalRevenue,
        customers: totalCustomers,
        emptySessions: totalEmpty,
        new: totalNew,
        converted: totalConverted,
        retained: totalRetained
      },
      fillRates: {
        powerCycle: powerCycleFillRate,
        barre: barreFillRate,
        strength: strengthFillRate
      },
      averages: {
        powerCycle: powerCycleAvgCustomers,
        barre: barreAvgCustomers,
        strength: strengthAvgCustomers
      }
    };
  }, [data]);

  if (!metrics) return null;

  const metricCards = [
    // PowerCycle Metrics
    {
      title: 'PowerCycle Sessions',
      value: formatNumber(metrics.powerCycle.totalSessions),
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      data: { type: 'powercycle', metric: 'sessions', value: metrics.powerCycle.totalSessions }
    },
    {
      title: 'PowerCycle Revenue',
      value: `₹${formatNumber(metrics.powerCycle.totalRevenue)}`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      data: { type: 'powercycle', metric: 'revenue', value: metrics.powerCycle.totalRevenue }
    },
    {
      title: 'PowerCycle Fill Rate',
      value: `${metrics.fillRates.powerCycle.toFixed(1)}%`,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      data: { type: 'powercycle', metric: 'fillRate', value: metrics.fillRates.powerCycle }
    },
    
    // Barre Metrics
    {
      title: 'Barre Sessions',
      value: formatNumber(metrics.barre.totalSessions),
      icon: Activity,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      data: { type: 'barre', metric: 'sessions', value: metrics.barre.totalSessions }
    },
    {
      title: 'Barre Revenue',
      value: `₹${formatNumber(metrics.barre.totalRevenue)}`,
      icon: DollarSign,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      data: { type: 'barre', metric: 'revenue', value: metrics.barre.totalRevenue }
    },
    {
      title: 'Barre Fill Rate',
      value: `${metrics.fillRates.barre.toFixed(1)}%`,
      icon: Target,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      data: { type: 'barre', metric: 'fillRate', value: metrics.fillRates.barre }
    },

    // Strength Metrics
    {
      title: 'Strength Sessions',
      value: formatNumber(metrics.strength.totalSessions),
      icon: Dumbbell,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      data: { type: 'strength', metric: 'sessions', value: metrics.strength.totalSessions }
    },
    {
      title: 'Strength Revenue',
      value: `₹${formatNumber(metrics.strength.totalRevenue)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      data: { type: 'strength', metric: 'revenue', value: metrics.strength.totalRevenue }
    },
    {
      title: 'Strength Fill Rate',
      value: `${metrics.fillRates.strength.toFixed(1)}%`,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      data: { type: 'strength', metric: 'fillRate', value: metrics.fillRates.strength }
    },

    // Overall Metrics
    {
      title: 'Total New Members',
      value: formatNumber(metrics.totals.new),
      icon: UserPlus,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      data: { type: 'overall', metric: 'new', value: metrics.totals.new }
    },
    {
      title: 'Total Converted',
      value: formatNumber(metrics.totals.converted),
      icon: UserCheck,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      data: { type: 'overall', metric: 'converted', value: metrics.totals.converted }
    },
    {
      title: 'Total Retained',
      value: formatNumber(metrics.totals.retained),
      icon: Users,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
      data: { type: 'overall', metric: 'retained', value: metrics.totals.retained }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <Card 
            key={index}
            className={`bg-gradient-to-br ${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            onClick={() => onItemClick(card.data)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/50 text-gray-700">
                  {card.data.type.charAt(0).toUpperCase() + card.data.type.slice(1)}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Comparison Card */}
      <Card className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            Format Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PowerCycle Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">PowerCycle</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Sessions:</span>
                  <span className="font-medium">{formatNumber(metrics.powerCycle.totalSessions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Revenue:</span>
                  <span className="font-medium">₹{formatNumber(metrics.powerCycle.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Avg/Session:</span>
                  <span className="font-medium">{metrics.averages.powerCycle.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Barre Summary */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-pink-600" />
                <h4 className="font-semibold text-pink-900">Barre</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-pink-700">Sessions:</span>
                  <span className="font-medium">{formatNumber(metrics.barre.totalSessions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-700">Revenue:</span>
                  <span className="font-medium">₹{formatNumber(metrics.barre.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-700">Avg/Session:</span>
                  <span className="font-medium">{metrics.averages.barre.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Strength Summary */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Dumbbell className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Strength Lab</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Sessions:</span>
                  <span className="font-medium">{formatNumber(metrics.strength.totalSessions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Revenue:</span>
                  <span className="font-medium">₹{formatNumber(metrics.strength.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Avg/Session:</span>
                  <span className="font-medium">{metrics.averages.strength.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};