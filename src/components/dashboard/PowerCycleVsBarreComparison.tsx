
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Calendar, Zap } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface PowerCycleVsBarreComparisonProps {
  powerCycleMetrics: {
    totalSessions: number;
    totalAttendance: number;
    totalCapacity: number;
    totalBookings: number;
    emptySessions: number;
    avgFillRate: number;
    avgSessionSize: number;
    avgSessionSizeExclEmpty: number;
    noShows: number;
  };
  barreMetrics: {
    totalSessions: number;
    totalAttendance: number;
    totalCapacity: number;
    totalBookings: number;
    emptySessions: number;
    avgFillRate: number;
    avgSessionSize: number;
    avgSessionSizeExclEmpty: number;
    noShows: number;
  };
  onItemClick?: (item: any) => void;
}

export const PowerCycleVsBarreComparison: React.FC<PowerCycleVsBarreComparisonProps> = ({
  powerCycleMetrics,
  barreMetrics,
  onItemClick
}) => {
  const getComparisonData = () => {
    return [
      {
        metric: 'Total Sessions',
        powerCycle: powerCycleMetrics.totalSessions,
        barre: barreMetrics.totalSessions,
        icon: Calendar,
        format: 'number'
      },
      {
        metric: 'Total Attendance',
        powerCycle: powerCycleMetrics.totalAttendance,
        barre: barreMetrics.totalAttendance,
        icon: Users,
        format: 'number'
      },
      {
        metric: 'Average Fill Rate',
        powerCycle: powerCycleMetrics.avgFillRate,
        barre: barreMetrics.avgFillRate,
        icon: Target,
        format: 'percentage'
      },
      {
        metric: 'Average Session Size',
        powerCycle: powerCycleMetrics.avgSessionSize,
        barre: barreMetrics.avgSessionSize,
        icon: Users,
        format: 'decimal'
      },
      {
        metric: 'Empty Sessions',
        powerCycle: powerCycleMetrics.emptySessions,
        barre: barreMetrics.emptySessions,
        icon: TrendingDown,
        format: 'number'
      },
      {
        metric: 'No Shows',
        powerCycle: powerCycleMetrics.noShows,
        barre: barreMetrics.noShows,
        icon: TrendingDown,
        format: 'number'
      }
    ];
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'decimal':
        return value.toFixed(1);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  const getWinner = (pcValue: number, barreValue: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      return pcValue > barreValue ? 'powercycle' : pcValue < barreValue ? 'barre' : 'tie';
    } else {
      return pcValue < barreValue ? 'powercycle' : pcValue > barreValue ? 'barre' : 'tie';
    }
  };

  const comparisonData = getComparisonData();

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          PowerCycle vs Barre Comparison
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonData.map((item, index) => {
            const winner = getWinner(
              item.powerCycle, 
              item.barre, 
              !['Empty Sessions', 'No Shows'].includes(item.metric)
            );
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onItemClick?.({ type: 'comparison', metric: item.metric, data: item })}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.metric}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">PowerCycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatValue(item.powerCycle, item.format)}
                      </span>
                      {winner === 'powercycle' && (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Barre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatValue(item.barre, item.format)}
                      </span>
                      {winner === 'barre' && (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {winner === 'tie' && (
                    <div className="text-center">
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
                        Tie
                      </Badge>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 text-center">
                      Difference: {Math.abs(item.powerCycle - item.barre).toFixed(item.format === 'decimal' ? 1 : 0)}
                      {item.format === 'percentage' ? 'pp' : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
