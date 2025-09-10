import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { 
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  UserPlus,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface PowerCycleBarreStrengthComprehensiveRankingsProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
}

type RankingType = 
  | 'revenue' 
  | 'sessions' 
  | 'customers' 
  | 'fillRate' 
  | 'emptySessions' 
  | 'newMembers' 
  | 'conversion' 
  | 'retention' 
  | 'avgCustomers'
  | 'lateCancellation';

interface RankingOption {
  key: RankingType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  higherIsBetter: boolean;
}

export const PowerCycleBarreStrengthComprehensiveRankings: React.FC<PowerCycleBarreStrengthComprehensiveRankingsProps> = ({
  data,
  onItemClick
}) => {
  const [selectedRanking, setSelectedRanking] = useState<RankingType>('revenue');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'powercycle' | 'barre' | 'strength'>('all');

  const rankingOptions: RankingOption[] = [
    { key: 'revenue', label: 'Total Revenue', icon: DollarSign, description: 'Highest earning trainers', higherIsBetter: true },
    { key: 'sessions', label: 'Total Sessions', icon: Calendar, description: 'Most active trainers', higherIsBetter: true },
    { key: 'customers', label: 'Total Customers', icon: Users, description: 'Highest customer engagement', higherIsBetter: true },
    { key: 'fillRate', label: 'Fill Rate', icon: Target, description: 'Best session utilization', higherIsBetter: true },
    { key: 'emptySessions', label: 'Empty Sessions', icon: AlertTriangle, description: 'Least empty sessions', higherIsBetter: false },
    { key: 'newMembers', label: 'New Members', icon: UserPlus, description: 'Most new member acquisitions', higherIsBetter: true },
    { key: 'conversion', label: 'Conversion Rate', icon: UserCheck, description: 'Best conversion performance', higherIsBetter: true },
    { key: 'retention', label: 'Retention Rate', icon: Users, description: 'Best member retention', higherIsBetter: true },
    { key: 'avgCustomers', label: 'Avg Customers/Session', icon: Target, description: 'Best session efficiency', higherIsBetter: true },
  ];

  const rankedData = useMemo(() => {
    if (!data.length) return [];

    const processedData = data.map(trainer => {
      const totalSessions = trainer.totalSessions || 0;
      const totalEmptySessions = trainer.totalEmptySessions || 0;
      const totalRevenue = trainer.totalPaid || 0;
      const totalCustomers = trainer.totalCustomers || 0;
      const newMembers = trainer.new || 0;
      const converted = trainer.converted || 0;
      const retained = trainer.retained || 0;

      // Format-specific calculations
      const powerCycleRevenue = trainer.cyclePaid || 0;
      const barreRevenue = trainer.barrePaid || 0;
      const strengthRevenue = trainer.strengthPaid || 0;

      const powerCycleSessions = trainer.cycleSessions || 0;
      const barreSessions = trainer.barreSessions || 0;
      const strengthSessions = trainer.strengthSessions || 0;

      const powerCycleCustomers = trainer.cycleCustomers || 0;
      const barreCustomers = trainer.barreCustomers || 0;
      const strengthCustomers = trainer.strengthCustomers || 0;

      return {
        ...trainer,
        revenue: selectedFormat === 'all' ? totalRevenue :
                selectedFormat === 'powercycle' ? powerCycleRevenue :
                selectedFormat === 'barre' ? barreRevenue : strengthRevenue,
        sessions: selectedFormat === 'all' ? totalSessions :
                 selectedFormat === 'powercycle' ? powerCycleSessions :
                 selectedFormat === 'barre' ? barreSessions : strengthSessions,
        customers: selectedFormat === 'all' ? totalCustomers :
                  selectedFormat === 'powercycle' ? powerCycleCustomers :
                  selectedFormat === 'barre' ? barreCustomers : strengthCustomers,
        emptySessions: selectedFormat === 'all' ? totalEmptySessions :
                      selectedFormat === 'powercycle' ? (trainer.emptyCycleSessions || 0) :
                      selectedFormat === 'barre' ? (trainer.emptyBarreSessions || 0) :
                      (trainer.emptyStrengthSessions || 0),
        fillRate: totalSessions > 0 ? ((totalSessions - totalEmptySessions) / totalSessions) * 100 : 0,
        newMembers,
        conversion: parseFloat(trainer.conversion?.replace('%', '') || '0'),
        retention: parseFloat(trainer.retention?.replace('%', '') || '0'),
        avgCustomers: (totalSessions - totalEmptySessions) > 0 ? totalCustomers / (totalSessions - totalEmptySessions) : 0,
        lateCancellation: 0, // This would need to be calculated from actual data
      };
    });

    const currentOption = rankingOptions.find(opt => opt.key === selectedRanking);
    if (!currentOption) return [];

    return processedData
      .filter(trainer => trainer[selectedRanking] > 0)
      .sort((a, b) => {
        const aValue = a[selectedRanking] as number;
        const bValue = b[selectedRanking] as number;
        return currentOption.higherIsBetter ? bValue - aValue : aValue - bValue;
      });
  }, [data, selectedRanking, selectedFormat]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const formatValue = (value: number, type: RankingType) => {
    switch (type) {
      case 'revenue':
        return `₹${formatNumber(value)}`;
      case 'fillRate':
      case 'conversion':
      case 'retention':
        return `${value.toFixed(1)}%`;
      case 'avgCustomers':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const currentOption = rankingOptions.find(opt => opt.key === selectedRanking);

  return (
    <div className="space-y-6">
      {/* Ranking Controls */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Trainer Rankings & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFormat === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('all')}
            >
              All Formats
            </Button>
            <Button
              variant={selectedFormat === 'powercycle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('powercycle')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              PowerCycle
            </Button>
            <Button
              variant={selectedFormat === 'barre' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('barre')}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Barre
            </Button>
            <Button
              variant={selectedFormat === 'strength' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat('strength')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Strength Lab
            </Button>
          </div>

          {/* Ranking Type Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {rankingOptions.map((option) => (
              <Button
                key={option.key}
                variant={selectedRanking === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRanking(option.key)}
                className="flex items-center gap-2 text-xs"
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rankings Display */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-3">
            {currentOption?.icon && <currentOption.icon className="w-5 h-5" />}
            {currentOption?.label} Rankings
            <Badge variant="secondary" className="ml-auto">
              {selectedFormat === 'all' ? 'All Formats' : 
               selectedFormat === 'powercycle' ? 'PowerCycle' :
               selectedFormat === 'barre' ? 'Barre' : 'Strength Lab'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">{currentOption?.description}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {rankedData.slice(0, 15).map((trainer, index) => (
              <div
                key={trainer.unique}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50/30' :
                  index === 1 ? 'border-gray-400 bg-gray-50/30' :
                  index === 2 ? 'border-amber-400 bg-amber-50/30' :
                  'border-transparent'
                }`}
                onClick={() => onItemClick({ 
                  type: 'trainer', 
                  trainer, 
                  rank: index + 1, 
                  metric: selectedRanking,
                  format: selectedFormat 
                })}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trainer.teacherName}</h3>
                    <p className="text-sm text-gray-600">{trainer.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatValue(trainer[selectedRanking] as number, selectedRanking)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trainer.totalSessions > 0 && `${trainer.totalSessions} sessions`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rankedData.slice(0, 3).map((trainer, index) => (
          <Card
            key={trainer.unique}
            className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
              index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
              index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200' :
              'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
            }`}
            onClick={() => onItemClick({ 
              type: 'trainer', 
              trainer, 
              rank: index + 1, 
              metric: selectedRanking,
              format: selectedFormat 
            })}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {getRankIcon(index + 1)}
                <div>
                  <h3 className="font-bold text-lg">{trainer.teacherName}</h3>
                  <p className="text-sm text-gray-600">{trainer.location}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatValue(trainer[selectedRanking] as number, selectedRanking)}
                </div>
                <div className="text-sm text-gray-600">{currentOption?.label}</div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{trainer.totalSessions} sessions</span>
                  <span>{trainer.totalCustomers} customers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};