import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Target, Activity, DollarSign, Zap } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { cn } from '@/lib/utils';

interface EnhancedTrainerRankingsProps {
  data: ProcessedTrainerData[];
  onTrainerClick?: (trainer: string, data: any) => void;
}

export const EnhancedTrainerRankings: React.FC<EnhancedTrainerRankingsProps> = ({
  data,
  onTrainerClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'sessions' | 'customers' | 'efficiency' | 'classAverage' | 'conversion' | 'retention' | 'emptySessions'>('revenue');
  const [viewMode, setViewMode] = useState<'top' | 'bottom' | 'all'>('top');
  const [showCount, setShowCount] = useState(5);

  const rankedTrainers = useMemo(() => {
    const trainerStats = data.reduce((acc, trainer) => {
      if (!acc[trainer.trainerName]) {
        acc[trainer.trainerName] = {
          name: trainer.trainerName,
          location: trainer.location,
          totalRevenue: 0,
          totalSessions: 0,
          totalCustomers: 0,
          emptySessions: 0,
          avgClassSize: 0,
          efficiency: 0,
          conversionRate: 0,
          retentionRate: 0,
          records: 0
        };
      }
      
      const stats = acc[trainer.trainerName];
      stats.totalRevenue += trainer.totalPaid;
      stats.totalSessions += trainer.totalSessions;
      stats.totalCustomers += trainer.totalCustomers;
      stats.emptySessions += trainer.emptySessions;
      stats.conversionRate += trainer.conversionRate;
      stats.retentionRate += trainer.retentionRate;
      stats.records += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const trainers = Object.values(trainerStats).map((trainer: any) => ({
      ...trainer,
      avgClassSize: trainer.totalSessions > 0 ? trainer.totalCustomers / trainer.totalSessions : 0,
      efficiency: trainer.totalSessions > 0 ? trainer.totalRevenue / trainer.totalSessions : 0,
      conversionRate: trainer.conversionRate / trainer.records,
      retentionRate: trainer.retentionRate / trainer.records
    }));

    // Sort based on selected metric
    const sortedTrainers = trainers.sort((a, b) => {
      switch (selectedMetric) {
        case 'revenue': return b.totalRevenue - a.totalRevenue;
        case 'sessions': return b.totalSessions - a.totalSessions;
        case 'customers': return b.totalCustomers - a.totalCustomers;
        case 'efficiency': return b.efficiency - a.efficiency;
        case 'classAverage': return b.avgClassSize - a.avgClassSize;
        case 'conversion': return b.conversionRate - a.conversionRate;
        case 'retention': return b.retentionRate - a.retentionRate;
        case 'emptySessions': return b.emptySessions - a.emptySessions;
        default: return b.totalRevenue - a.totalRevenue;
      }
    });

    if (viewMode === 'bottom') {
      return sortedTrainers.reverse().slice(0, showCount);
    } else if (viewMode === 'top') {
      return sortedTrainers.slice(0, showCount);
    }
    return sortedTrainers;
  }, [data, selectedMetric, viewMode, showCount]);

  const getMetricValue = (trainer: any) => {
    switch (selectedMetric) {
      case 'revenue': return formatCurrency(trainer.totalRevenue);
      case 'sessions': return formatNumber(trainer.totalSessions);
      case 'customers': return formatNumber(trainer.totalCustomers);
      case 'efficiency': return formatCurrency(trainer.efficiency);
      case 'classAverage': return trainer.avgClassSize.toFixed(1);
      case 'conversion': return trainer.conversionRate.toFixed(1) + '%';
      case 'retention': return trainer.retentionRate.toFixed(1) + '%';
      case 'emptySessions': return formatNumber(trainer.emptySessions);
      default: return formatCurrency(trainer.totalRevenue);
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'revenue': return DollarSign;
      case 'sessions': return Activity;
      case 'customers': return Users;
      case 'efficiency': return Zap;
      case 'classAverage': return Users;
      case 'conversion': return TrendingUp;
      case 'retention': return Target;
      case 'emptySessions': return Activity;
      default: return DollarSign;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-blue-600" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  const MetricIcon = getMetricIcon();

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Trophy className="w-6 h-6" />
              Trainer Rankings & Performance
            </CardTitle>
            <Badge className="bg-white/20 text-white border-white/30">
              Interactive Rankings
            </Badge>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Metric Selection */}
            <div className="flex flex-wrap bg-white/10 backdrop-blur-sm rounded-lg p-1 gap-1">
              {[
                { key: 'revenue', label: 'Revenue', icon: DollarSign },
                { key: 'sessions', label: 'Sessions', icon: Activity },
                { key: 'customers', label: 'Members', icon: Users },
                { key: 'efficiency', label: 'Efficiency', icon: Zap },
                { key: 'classAverage', label: 'Class Avg', icon: Users },
                { key: 'conversion', label: 'Conversion', icon: TrendingUp },
                { key: 'retention', label: 'Retention', icon: Target },
                { key: 'emptySessions', label: 'Empty Sessions', icon: Activity }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedMetric === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric(key as any)}
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    selectedMetric === key 
                      ? "bg-white text-purple-600 shadow-sm hover:bg-gray-50" 
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {[
                { key: 'top', label: 'Top Performers' },
                { key: 'bottom', label: 'Growth Opportunities' },
                { key: 'all', label: 'All Trainers' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={viewMode === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(key as any)}
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    viewMode === key 
                      ? "bg-white text-purple-600 shadow-sm hover:bg-gray-50" 
                      : "text-white hover:bg-white/20"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Show Count */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {[5, 10, 15].map((count) => (
                <Button
                  key={count}
                  variant={showCount === count ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowCount(count)}
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    showCount === count 
                      ? "bg-white text-purple-600 shadow-sm hover:bg-gray-50" 
                      : "text-white hover:bg-white/20"
                  )}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {rankedTrainers.map((trainer, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <div
                key={trainer.name}
                onClick={() => onTrainerClick?.(trainer.name, trainer)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer",
                  "hover:shadow-lg hover:scale-[1.02] hover:border-purple-300",
                  isTopThree 
                    ? "bg-gradient-to-r from-white via-yellow-50/50 to-white border-yellow-200 shadow-md" 
                    : "bg-white hover:bg-purple-50/30 border-gray-200"
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Rank Badge */}
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full font-bold text-white shadow-lg",
                    `bg-gradient-to-br ${getRankColor(rank)}`
                  )}>
                    {isTopThree ? (
                      getRankIcon(rank)
                    ) : (
                      <span className="text-lg">#{rank}</span>
                    )}
                  </div>

                  {/* Trainer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{trainer.name}</h3>
                      {isTopThree && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs animate-pulse">
                          <Star className="w-3 h-3 mr-1" />
                          Top Performer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {trainer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {formatNumber(trainer.totalSessions)} sessions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {trainer.avgClassSize.toFixed(1)} avg size
                      </span>
                    </div>
                  </div>

                  {/* Primary Metric */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <MetricIcon className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-xl text-gray-900">
                        {getMetricValue(trainer)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {selectedMetric} Leader
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {trainer.conversionRate.toFixed(1)}% conv
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        {trainer.retentionRate.toFixed(1)}% ret
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {rankedTrainers.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trainer data available for rankings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};