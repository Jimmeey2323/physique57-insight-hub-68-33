import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingDown, 
  MapPin, 
  Users, 
  DollarSign, 
  Target, 
  Crown, 
  AlertTriangle,
  Star,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionSimplifiedRanksProps {
  data: NewClientData[];
}

export const ClientConversionSimplifiedRanks: React.FC<ClientConversionSimplifiedRanksProps> = ({ data }) => {
  const [selectedRanking, setSelectedRanking] = useState('trainer-conversion');

  // Calculate stats
  const trainerStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const trainer = client.trainerName || 'Unknown';
      if (!stats.has(trainer)) {
        stats.set(trainer, {
          name: trainer,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          trialsCompleted: 0
        });
      }
      
      const trainerStat = stats.get(trainer);
      trainerStat.totalClients++;
      trainerStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        trainerStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        trainerStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        trainerStat.retained++;
      }
      if ((client.visitsPostTrial || 0) > 0) {
        trainerStat.trialsCompleted++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      trialConversionRate: stat.trialsCompleted > 0 ? (stat.converted / stat.trialsCompleted) * 100 : 0
    }));
  }, [data]);

  const locationStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      if (!stats.has(location)) {
        stats.set(location, {
          name: location,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          trialsCompleted: 0
        });
      }
      
      const locationStat = stats.get(location);
      locationStat.totalClients++;
      locationStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        locationStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        locationStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        locationStat.retained++;
      }
      if ((client.visitsPostTrial || 0) > 0) {
        locationStat.trialsCompleted++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      trialConversionRate: stat.trialsCompleted > 0 ? (stat.converted / stat.trialsCompleted) * 100 : 0
    }));
  }, [data]);

  // Calculate class stats
  const classStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const className = client.firstVisitEntityName || 'Unknown Class';
      if (!stats.has(className)) {
        stats.set(className, {
          name: className,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          trialsCompleted: 0
        });
      }
      
      const classStat = stats.get(className);
      classStat.totalClients++;
      classStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        classStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        classStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        classStat.retained++;
      }
      if ((client.visitsPostTrial || 0) > 0) {
        classStat.trialsCompleted++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      trialConversionRate: stat.trialsCompleted > 0 ? (stat.converted / stat.trialsCompleted) * 100 : 0
    }));
  }, [data]);

  // Calculate membership stats
  const membershipStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const membership = client.membershipUsed || 'Unknown Membership';
      if (!stats.has(membership)) {
        stats.set(membership, {
          name: membership,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          trialsCompleted: 0
        });
      }
      
      const membershipStat = stats.get(membership);
      membershipStat.totalClients++;
      membershipStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        membershipStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        membershipStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        membershipStat.retained++;
      }
      if ((client.visitsPostTrial || 0) > 0) {
        membershipStat.trialsCompleted++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      trialConversionRate: stat.trialsCompleted > 0 ? (stat.converted / stat.trialsCompleted) * 100 : 0
    }));
  }, [data]);

  // Calculate hosted classes stats (by trainer and class combination)
  const hostedClassStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const hostedClass = `${client.trainerName || 'Unknown'} - ${client.firstVisitEntityName || 'Unknown Class'}`;
      if (!stats.has(hostedClass)) {
        stats.set(hostedClass, {
          name: hostedClass,
          trainer: client.trainerName || 'Unknown',
          className: client.firstVisitEntityName || 'Unknown Class',
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          trialsCompleted: 0
        });
      }
      
      const hostedStat = stats.get(hostedClass);
      hostedStat.totalClients++;
      hostedStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        hostedStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        hostedStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        hostedStat.retained++;
      }
      if ((client.visitsPostTrial || 0) > 0) {
        hostedStat.trialsCompleted++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      trialConversionRate: stat.trialsCompleted > 0 ? (stat.converted / stat.trialsCompleted) * 100 : 0
    }));
  }, [data]);

  const rankingOptions = [
    // Trainers
    { id: 'trainer-conversion', label: 'Trainer Conversion', icon: Trophy, type: 'trainer', metric: 'conversionRate' },
    { id: 'trainer-retention', label: 'Trainer Retention', icon: Target, type: 'trainer', metric: 'retentionRate' },
    { id: 'trainer-ltv', label: 'Trainer LTV', icon: DollarSign, type: 'trainer', metric: 'avgLTV' },
    { id: 'trainer-volume', label: 'Trainer Volume', icon: Users, type: 'trainer', metric: 'totalClients' },
    
    // Locations
    { id: 'location-conversion', label: 'Location Conversion', icon: MapPin, type: 'location', metric: 'conversionRate' },
    { id: 'location-retention', label: 'Location Retention', icon: Award, type: 'location', metric: 'retentionRate' },
    { id: 'location-ltv', label: 'Location LTV', icon: TrendingUp, type: 'location', metric: 'avgLTV' },
    { id: 'location-volume', label: 'Location Volume', icon: Users, type: 'location', metric: 'totalClients' },
    
    // Classes
    { id: 'class-conversion', label: 'Class Conversion', icon: Calendar, type: 'class', metric: 'conversionRate' },
    { id: 'class-retention', label: 'Class Retention', icon: Star, type: 'class', metric: 'retentionRate' },
    { id: 'class-ltv', label: 'Class LTV', icon: DollarSign, type: 'class', metric: 'avgLTV' },
    { id: 'class-volume', label: 'Class Volume', icon: Users, type: 'class', metric: 'totalClients' },
    
    // Memberships
    { id: 'membership-conversion', label: 'Membership Conversion', icon: Award, type: 'membership', metric: 'conversionRate' },
    { id: 'membership-retention', label: 'Membership Retention', icon: Target, type: 'membership', metric: 'retentionRate' },
    { id: 'membership-ltv', label: 'Membership LTV', icon: DollarSign, type: 'membership', metric: 'avgLTV' },
    { id: 'membership-volume', label: 'Membership Volume', icon: Users, type: 'membership', metric: 'totalClients' },
    
    // Hosted Classes
    { id: 'hosted-conversion', label: 'Hosted Class Conversion', icon: Trophy, type: 'hosted', metric: 'conversionRate' },
    { id: 'hosted-retention', label: 'Hosted Class Retention', icon: Target, type: 'hosted', metric: 'retentionRate' },
    { id: 'hosted-ltv', label: 'Hosted Class LTV', icon: DollarSign, type: 'hosted', metric: 'avgLTV' },
    { id: 'hosted-volume', label: 'Hosted Class Volume', icon: Users, type: 'hosted', metric: 'totalClients' }
  ];

  const getCurrentData = () => {
    const option = rankingOptions.find(r => r.id === selectedRanking);
    if (!option) return { top: [], bottom: [] };

    let sourceData;
    switch (option.type) {
      case 'trainer':
        sourceData = trainerStats;
        break;
      case 'location':
        sourceData = locationStats;
        break;
      case 'class':
        sourceData = classStats;
        break;
      case 'membership':
        sourceData = membershipStats;
        break;
      case 'hosted':
        sourceData = hostedClassStats;
        break;
      default:
        sourceData = trainerStats;
    }

    const minThreshold = option.type === 'hosted' ? 1 : (option.type === 'trainer' ? 3 : 1);
    
    const filtered = sourceData.filter(item => 
      option.metric === 'totalClients' ? item.totalClients >= 1 : item.newMembers >= minThreshold
    );
    
    const sorted = [...filtered].sort((a, b) => b[option.metric] - a[option.metric]);
    
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse()
    };
  };

  const { top, bottom } = getCurrentData();
  const currentOption = rankingOptions.find(r => r.id === selectedRanking);

  const formatValue = (value: number, metric: string) => {
    if (metric === 'avgLTV') return formatCurrency(value);
    if (metric === 'totalClients') return formatNumber(value);
    return `${value.toFixed(1)}%`;
  };

  const RankCard = ({ title, data: rankData, isTop = true }) => (
    <Card className="group bg-white shadow-lg border-0 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <CardHeader className={`bg-gradient-to-r ${
        isTop 
          ? 'from-emerald-500 to-teal-600' 
          : 'from-orange-500 to-red-600'
      } text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
          {isTop ? <Crown className="w-20 h-20" /> : <AlertTriangle className="w-20 h-20" />}
        </div>
        <CardTitle className="flex items-center gap-3 relative z-10">
          {isTop ? <Crown className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm opacity-90 font-normal">
              {isTop ? 'Top performers' : 'Needs attention'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {rankData.map((item, index) => (
          <div 
            key={item.name} 
            className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-300 group-hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                index === 0 && isTop ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' :
                index === 1 && isTop ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg' :
                index === 2 && isTop ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg' :
                'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-900 truncate max-w-[140px]" title={item.name}>
                  {item.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatNumber(item.totalClients)} clients
                  {item.trainer && <span className="block text-xs">by {item.trainer}</span>}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                className={`font-bold text-sm px-3 py-1 ${
                  isTop 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                }`}
              >
                {formatValue(item[currentOption?.metric || 'conversionRate'], currentOption?.metric || 'conversionRate')}
              </Badge>
              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(item.avgLTV)} LTV
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Ranking Selection Buttons */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {rankingOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedRanking === option.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRanking(option.id)}
                className={`flex flex-col items-center gap-2 h-auto py-3 px-2 transition-all duration-300 hover:scale-105 ${
                  selectedRanking === option.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-xs font-medium text-center leading-tight">
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top and Bottom Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankCard
          title={`Top ${currentOption?.label || 'Performance'}`}
          data={top}
          isTop={true}
        />
        
        <RankCard
          title={`Bottom ${currentOption?.label || 'Performance'}`}
          data={bottom}
          isTop={false}
        />
      </div>
    </div>
  );
};