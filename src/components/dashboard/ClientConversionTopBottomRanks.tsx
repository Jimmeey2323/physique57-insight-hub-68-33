import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingDown, MapPin, Users, DollarSign, Target, Crown, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionTopBottomRanksProps {
  data: NewClientData[];
}

export const ClientConversionTopBottomRanks: React.FC<ClientConversionTopBottomRanksProps> = ({ data }) => {
  // Calculate trainer performance
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
          totalLTV: 0
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
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0
    }));
  }, [data]);

  // Calculate location performance
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
          totalLTV: 0
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
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0
    }));
  }, [data]);

  // Top performers
  const topTrainersByConversion = trainerStats
    .filter(t => t.newMembers >= 3) // Minimum threshold
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5);

  const topTrainersByLTV = trainerStats
    .sort((a, b) => b.avgLTV - a.avgLTV)
    .slice(0, 5);

  const topLocationsByConversion = locationStats
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3);

  // Bottom performers
  const bottomTrainersByConversion = trainerStats
    .filter(t => t.newMembers >= 3)
    .sort((a, b) => a.conversionRate - b.conversionRate)
    .slice(0, 5);

  const bottomLocationsByConversion = locationStats
    .sort((a, b) => a.conversionRate - b.conversionRate)
    .slice(0, 3);

  const RankCard = ({ title, data: rankData, icon: Icon, gradient, isTop = true, type = 'trainer' }) => (
    <Card className="bg-white shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
      <CardHeader className={`bg-gradient-to-r ${gradient} text-white`}>
        <CardTitle className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm opacity-90">
              {isTop ? 'Best performers' : 'Needs attention'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {rankData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                index === 0 && isTop ? 'bg-gold text-yellow-800' :
                index === 1 && isTop ? 'bg-silver text-gray-600' :
                index === 2 && isTop ? 'bg-bronze text-orange-700' :
                'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900 truncate max-w-[120px]" title={item.name}>
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(item.totalClients)} clients
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                className={`${
                  isTop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {item.conversionRate.toFixed(1)}%
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(item.avgLTV)} LTV
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Top Trainers by Conversion */}
      <RankCard
        title="Top Trainers"
        data={topTrainersByConversion}
        icon={Crown}
        gradient="from-yellow-500 to-orange-600"
        isTop={true}
        type="trainer"
      />

      {/* Top Locations */}
      <RankCard
        title="Top Locations"
        data={topLocationsByConversion}
        icon={MapPin}
        gradient="from-green-500 to-emerald-600"
        isTop={true}
        type="location"
      />

      {/* Top Trainers by LTV */}
      <RankCard
        title="Highest LTV Trainers"
        data={topTrainersByLTV}
        icon={DollarSign}
        gradient="from-purple-500 to-indigo-600"
        isTop={true}
        type="trainer"
      />

      {/* Bottom Trainers */}
      <RankCard
        title="Improvement Needed"
        data={bottomTrainersByConversion}
        icon={AlertTriangle}
        gradient="from-red-500 to-pink-600"
        isTop={false}
        type="trainer"
      />

      {/* Bottom Locations */}
      <RankCard
        title="Focus Areas"
        data={bottomLocationsByConversion}
        icon={TrendingDown}
        gradient="from-orange-500 to-red-600"
        isTop={false}
        type="location"
      />

      {/* Performance Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <Trophy className="w-6 h-6" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Best Conversion Rate</span>
              <Badge className="bg-green-100 text-green-800">
                {topTrainersByConversion[0]?.conversionRate.toFixed(1) || 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Highest LTV</span>
              <Badge className="bg-purple-100 text-purple-800">
                {formatCurrency(topTrainersByLTV[0]?.avgLTV || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Total Trainers</span>
              <Badge className="bg-blue-100 text-blue-800">
                {trainerStats.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Total Locations</span>
              <Badge className="bg-indigo-100 text-indigo-800">
                {locationStats.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};