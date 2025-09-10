import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingDown, 
  Crown, 
  Award, 
  Medal,
  ChevronRight,
  Zap,
  Activity,
  Dumbbell,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface PowerCycleBarreStrengthRankingsProps {
  data: PayrollData[];
  onItemClick?: (item: any, type: 'trainer' | 'location') => void;
}

export const PowerCycleBarreStrengthRankings: React.FC<PowerCycleBarreStrengthRankingsProps> = ({ 
  data, 
  onItemClick 
}) => {
  const [activeRanking, setActiveRanking] = useState('trainers');
  const [activeMetric, setActiveMetric] = useState('totalRevenue');

  const trainerRankings = useMemo(() => {
    const trainerMap = new Map();
    
    data.forEach(item => {
      const key = item.teacherName;
      if (!trainerMap.has(key)) {
        trainerMap.set(key, {
          name: key,
          location: item.location,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          powerCycleSessions: 0,
          powerCycleRevenue: 0,
          barreSessions: 0,
          barreRevenue: 0,
          strengthSessions: 0,
          strengthRevenue: 0,
          avgSessionRevenue: 0,
          fillRate: 0,
          retentionRate: item.retentionRate || 0,
          conversionRate: item.conversionRate || 0
        });
      }
      
      const existing = trainerMap.get(key);
      const updated = {
        ...existing,
        totalSessions: existing.totalSessions + (item.totalSessions || 0),
        totalRevenue: existing.totalRevenue + (item.totalPaid || 0),
        totalCustomers: existing.totalCustomers + (item.totalCustomers || 0),
        powerCycleSessions: existing.powerCycleSessions + (item.cycleSessions || 0),
        powerCycleRevenue: existing.powerCycleRevenue + (item.cyclePaid || 0),
        barreSessions: existing.barreSessions + (item.barreSessions || 0),
        barreRevenue: existing.barreRevenue + (item.barrePaid || 0),
        strengthSessions: existing.strengthSessions + (item.strengthSessions || 0),
        strengthRevenue: existing.strengthRevenue + (item.strengthPaid || 0)
      };
      
      // Calculate derived metrics
      updated.avgSessionRevenue = updated.totalSessions > 0 ? updated.totalRevenue / updated.totalSessions : 0;
      updated.fillRate = updated.totalSessions > 0 ? (updated.totalCustomers / updated.totalSessions) : 0;
      
      trainerMap.set(key, updated);
    });
    
    return Array.from(trainerMap.values());
  }, [data]);

  const locationRankings = useMemo(() => {
    const locationMap = new Map();
    
    data.forEach(item => {
      const key = item.location;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          name: key,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          powerCycleSessions: 0,
          powerCycleRevenue: 0,
          barreSessions: 0,
          barreRevenue: 0,
          strengthSessions: 0,
          strengthRevenue: 0,
          trainerCount: new Set(),
          avgSessionRevenue: 0,
          fillRate: 0
        });
      }
      
      const existing = locationMap.get(key);
      existing.trainerCount.add(item.teacherName);
      
      // Update existing object properties directly to preserve trainerCount Set
      existing.totalSessions += (item.totalSessions || 0);
      existing.totalRevenue += (item.totalPaid || 0);
      existing.totalCustomers += (item.totalCustomers || 0);
      existing.powerCycleSessions += (item.cycleSessions || 0);
      existing.powerCycleRevenue += (item.cyclePaid || 0);
      existing.barreSessions += (item.barreSessions || 0);
      existing.barreRevenue += (item.barrePaid || 0);
      existing.strengthSessions += (item.strengthSessions || 0);
      existing.strengthRevenue += (item.strengthPaid || 0);
      
      // Calculate derived metrics
      existing.avgSessionRevenue = existing.totalSessions > 0 ? existing.totalRevenue / existing.totalSessions : 0;
      existing.fillRate = existing.totalSessions > 0 ? (existing.totalCustomers / existing.totalSessions) : 0;
    });
    
    return Array.from(locationMap.values()).map(location => ({
      ...location,
      trainerCount: location.trainerCount.size
    }));
  }, [data]);

  const metricOptions = [
    { value: 'totalRevenue', label: 'Total Revenue', icon: DollarSign },
    { value: 'totalSessions', label: 'Total Sessions', icon: Calendar },
    { value: 'totalCustomers', label: 'Total Customers', icon: Users },
    { value: 'avgSessionRevenue', label: 'Avg Revenue/Session', icon: TrendingDown },
    { value: 'fillRate', label: 'Fill Rate', icon: Activity },
    { value: 'powerCycleRevenue', label: 'PowerCycle Revenue', icon: Zap },
    { value: 'barreRevenue', label: 'Barre Revenue', icon: Activity },
    { value: 'strengthRevenue', label: 'Strength Revenue', icon: Dumbbell }
  ];

  const getRankings = (type: 'trainers' | 'locations', metric: string, isTop = true) => {
    const rankings = type === 'trainers' ? trainerRankings : locationRankings;
    const sorted = [...rankings].sort((a, b) => isTop ? b[metric] - a[metric] : a[metric] - b[metric]);
    return sorted.slice(0, 10);
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes('Revenue') || metric.includes('revenue')) {
      return formatCurrency(value);
    }
    if (metric === 'fillRate') {
      return formatPercentage(value);
    }
    return formatNumber(value);
  };

  const getIcon = (rank: number, isTop: boolean) => {
    if (isTop) {
      switch (rank) {
        case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
        case 2: return <Medal className="w-5 h-5 text-gray-400" />;
        case 3: return <Award className="w-5 h-5 text-amber-600" />;
        default: return <Trophy className="w-4 h-4 text-blue-500" />;
      }
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const RankingCard = ({ 
    title, 
    rankings, 
    isTop = true, 
    type 
  }: { 
    title: string; 
    rankings: any[]; 
    isTop?: boolean; 
    type: 'trainer' | 'location' 
  }) => (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          {isTop ? <Trophy className="w-5 h-5 text-yellow-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
          {title}
          <Badge className={isTop ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
            {rankings.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rankings.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            onClick={() => onItemClick?.(item, type)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getIcon(index + 1, isTop)}
                <span className="text-white font-bold text-lg">#{index + 1}</span>
              </div>
              
              <div>
                <h4 className="text-white font-medium">{item.name}</h4>
                {type === 'trainer' && (
                  <p className="text-gray-300 text-sm">{item.location}</p>
                )}
                {type === 'location' && (
                  <p className="text-gray-300 text-sm">{item.trainerCount} trainers</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white font-bold">
                  {formatValue(item[activeMetric], activeMetric)}
                </div>
                <div className="text-gray-300 text-sm">
                  {metricOptions.find(m => m.value === activeMetric)?.label}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Ranking Controls */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Performance Rankings
          </CardTitle>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Ranking Type:</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeRanking === 'trainers' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveRanking('trainers')}
                  className={`gap-2 ${
                    activeRanking === 'trainers' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Trainers
                </Button>
                <Button
                  variant={activeRanking === 'locations' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveRanking('locations')}
                  className={`gap-2 ${
                    activeRanking === 'locations' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Locations
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Ranking Metric:</label>
              <div className="flex flex-wrap gap-2">
                {metricOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={activeMetric === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveMetric(option.value)}
                    className={`gap-2 ${
                      activeMetric === option.value 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          title={`Top 10 ${activeRanking === 'trainers' ? 'Trainers' : 'Locations'}`}
          rankings={getRankings(activeRanking as 'trainers' | 'locations', activeMetric, true)}
          isTop={true}
          type={activeRanking as 'trainer' | 'location'}
        />
        
        <RankingCard
          title={`Bottom 10 ${activeRanking === 'trainers' ? 'Trainers' : 'Locations'}`}
          rankings={getRankings(activeRanking as 'trainers' | 'locations', activeMetric, false)}
          isTop={false}
          type={activeRanking as 'trainer' | 'location'}
        />
      </div>
    </div>
  );
};