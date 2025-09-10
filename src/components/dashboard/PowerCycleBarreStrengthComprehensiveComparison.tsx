import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { 
  Zap, 
  Dumbbell, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users,
  DollarSign,
  Calendar,
  Minus
} from 'lucide-react';

interface PowerCycleBarreStrengthComprehensiveComparisonProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
  showDetailed?: boolean;
}

export const PowerCycleBarreStrengthComprehensiveComparison: React.FC<PowerCycleBarreStrengthComprehensiveComparisonProps> = ({
  data,
  onItemClick,
  showDetailed = false
}) => {
  const comparisonData = useMemo(() => {
    if (!data.length) return null;

    const powerCycle = {
      sessions: data.reduce((sum, item) => sum + (item.cycleSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyCycleSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.cycleCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.cyclePaid || 0), 0),
    };

    const barre = {
      sessions: data.reduce((sum, item) => sum + (item.barreSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyBarreSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.barreCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.barrePaid || 0), 0),
    };

    const strength = {
      sessions: data.reduce((sum, item) => sum + (item.strengthSessions || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyStrengthSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.strengthCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.strengthPaid || 0), 0),
    };

    // Calculate derived metrics
    const powerCycleEnhanced = {
      ...powerCycle,
      nonEmptySessions: powerCycle.sessions - powerCycle.emptySessions,
      fillRate: powerCycle.sessions > 0 ? ((powerCycle.sessions - powerCycle.emptySessions) / powerCycle.sessions) * 100 : 0,
      avgCustomersPerSession: (powerCycle.sessions - powerCycle.emptySessions) > 0 ? powerCycle.customers / (powerCycle.sessions - powerCycle.emptySessions) : 0,
      revenuePerSession: powerCycle.sessions > 0 ? powerCycle.revenue / powerCycle.sessions : 0,
      revenuePerCustomer: powerCycle.customers > 0 ? powerCycle.revenue / powerCycle.customers : 0,
    };

    const barreEnhanced = {
      ...barre,
      nonEmptySessions: barre.sessions - barre.emptySessions,
      fillRate: barre.sessions > 0 ? ((barre.sessions - barre.emptySessions) / barre.sessions) * 100 : 0,
      avgCustomersPerSession: (barre.sessions - barre.emptySessions) > 0 ? barre.customers / (barre.sessions - barre.emptySessions) : 0,
      revenuePerSession: barre.sessions > 0 ? barre.revenue / barre.sessions : 0,
      revenuePerCustomer: barre.customers > 0 ? barre.revenue / barre.customers : 0,
    };

    const strengthEnhanced = {
      ...strength,
      nonEmptySessions: strength.sessions - strength.emptySessions,
      fillRate: strength.sessions > 0 ? ((strength.sessions - strength.emptySessions) / strength.sessions) * 100 : 0,
      avgCustomersPerSession: (strength.sessions - strength.emptySessions) > 0 ? strength.customers / (strength.sessions - strength.emptySessions) : 0,
      revenuePerSession: strength.sessions > 0 ? strength.revenue / strength.sessions : 0,
      revenuePerCustomer: strength.customers > 0 ? strength.revenue / strength.customers : 0,
    };

    return { powerCycle: powerCycleEnhanced, barre: barreEnhanced, strength: strengthEnhanced };
  }, [data]);

  if (!comparisonData) return null;

  const getWinner = (metric: string, higherIsBetter: boolean = true) => {
    const values = {
      powerCycle: comparisonData.powerCycle[metric as keyof typeof comparisonData.powerCycle] as number,
      barre: comparisonData.barre[metric as keyof typeof comparisonData.barre] as number,
      strength: comparisonData.strength[metric as keyof typeof comparisonData.strength] as number,
    };

    const sortedEntries = Object.entries(values).sort(([,a], [,b]) => higherIsBetter ? b - a : a - b);
    return sortedEntries[0][0];
  };

  const formatValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'decimal') => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `₹${formatNumber(value)}`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const comparisonMetrics = [
    { key: 'sessions', label: 'Total Sessions', icon: Calendar, type: 'number' as const, higherIsBetter: true },
    { key: 'revenue', label: 'Total Revenue', icon: DollarSign, type: 'currency' as const, higherIsBetter: true },
    { key: 'customers', label: 'Total Customers', icon: Users, type: 'number' as const, higherIsBetter: true },
    { key: 'fillRate', label: 'Fill Rate', icon: Target, type: 'percentage' as const, higherIsBetter: true },
    { key: 'emptySessions', label: 'Empty Sessions', icon: TrendingDown, type: 'number' as const, higherIsBetter: false },
    { key: 'avgCustomersPerSession', label: 'Avg Customers/Session', icon: Users, type: 'decimal' as const, higherIsBetter: true },
    ...(showDetailed ? [
      { key: 'revenuePerSession', label: 'Revenue/Session', icon: DollarSign, type: 'currency' as const, higherIsBetter: true },
      { key: 'revenuePerCustomer', label: 'Revenue/Customer', icon: DollarSign, type: 'currency' as const, higherIsBetter: true },
      { key: 'nonEmptySessions', label: 'Non-Empty Sessions', icon: Calendar, type: 'number' as const, higherIsBetter: true },
    ] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Overall Winner Card */}
      <Card className="bg-gradient-to-br from-white via-yellow-50/30 to-amber-50/20 border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            Performance Comparison Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Format Cards */}
            {Object.entries(comparisonData).map(([format, data]) => (
              <div 
                key={format}
                className={`bg-gradient-to-br ${
                  format === 'powerCycle' ? 'from-blue-50 to-blue-100 border-blue-200' :
                  format === 'barre' ? 'from-pink-50 to-pink-100 border-pink-200' :
                  'from-green-50 to-green-100 border-green-200'
                } rounded-xl p-4 border cursor-pointer hover:shadow-lg transition-all duration-300`}
                onClick={() => onItemClick({ type: 'format', format, data })}
              >
                <div className="flex items-center gap-3 mb-4">
                  {format === 'powerCycle' && <Zap className="w-6 h-6 text-blue-600" />}
                  {format === 'barre' && <Activity className="w-6 h-6 text-pink-600" />}
                  {format === 'strength' && <Dumbbell className="w-6 h-6 text-green-600" />}
                  <h3 className={`font-bold text-lg ${
                    format === 'powerCycle' ? 'text-blue-900' :
                    format === 'barre' ? 'text-pink-900' :
                    'text-green-900'
                  }`}>
                    {format === 'powerCycle' ? 'PowerCycle' : 
                     format === 'barre' ? 'Barre' : 'Strength Lab'}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sessions:</span>
                    <span className="font-medium">{formatNumber(data.sessions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">₹{formatNumber(data.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fill Rate:</span>
                    <span className="font-medium">{data.fillRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonMetrics.map((metric) => {
          const winner = getWinner(metric.key, metric.higherIsBetter);
          
          return (
            <Card 
              key={metric.key}
              className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => onItemClick({ type: 'metric', metric: metric.key, data: comparisonData })}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <metric.icon className="w-4 h-4" />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* PowerCycle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">PowerCycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatValue(comparisonData.powerCycle[metric.key as keyof typeof comparisonData.powerCycle] as number, metric.type)}
                      </span>
                      {winner === 'powerCycle' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Barre */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Barre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatValue(comparisonData.barre[metric.key as keyof typeof comparisonData.barre] as number, metric.type)}
                      </span>
                      {winner === 'barre' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Strength */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Strength</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatValue(comparisonData.strength[metric.key as keyof typeof comparisonData.strength] as number, metric.type)}
                      </span>
                      {winner === 'strength' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};