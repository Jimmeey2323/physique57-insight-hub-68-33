import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Eye, ChevronRight, Award, Crown, Star, MapPin, Activity } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { motion } from 'framer-motion';

interface ClientConversionTopBottomListsProps {
  data: NewClientData[];
  onItemClick?: (item: any) => void;
}

export const ClientConversionTopBottomLists: React.FC<ClientConversionTopBottomListsProps> = ({
  data,
  onItemClick
}) => {
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');
  const [showCount, setShowCount] = useState(5);
  const [activeCategory, setActiveCategory] = useState<'trainers' | 'locations' | 'memberships' | 'entities'>('trainers');

  // Trainer performance analysis
  const trainerStats = data.reduce((acc, client) => {
    const trainer = client.trainerName || 'Unknown';
    if (!acc[trainer]) {
      acc[trainer] = {
        name: trainer,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[trainer].newClients++;
    if (client.conversionStatus === 'Converted') acc[trainer].conversions++;
    if (client.retentionStatus === 'Retained') acc[trainer].retained++;
    acc[trainer].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate rates
  Object.values(trainerStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const trainerList = Object.values(trainerStats) as any[];

  // Location performance analysis
  const locationStats = data.reduce((acc, client) => {
    const location = client.firstVisitLocation || 'Unknown';
    if (!acc[location]) {
      acc[location] = {
        name: location,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[location].newClients++;
    if (client.conversionStatus === 'Converted') acc[location].conversions++;
    if (client.retentionStatus === 'Retained') acc[location].retained++;
    acc[location].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate rates for locations
  Object.values(locationStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const locationList = Object.values(locationStats) as any[];

  // Membership type analysis
  const membershipStats = data.reduce((acc, client) => {
    const membership = client.membershipUsed || 'Unknown';
    if (!acc[membership]) {
      acc[membership] = {
        name: membership,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[membership].newClients++;
    if (client.conversionStatus === 'Converted') acc[membership].conversions++;
    if (client.retentionStatus === 'Retained') acc[membership].retained++;
    acc[membership].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  Object.values(membershipStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const membershipList = Object.values(membershipStats) as any[];

  // Entity analysis
  const entityStats = data.reduce((acc, client) => {
    const entity = client.firstVisitEntityName || 'Unknown';
    if (!acc[entity]) {
      acc[entity] = {
        name: entity,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        avgLTV: 0
      };
    }
    
    acc[entity].newClients++;
    if (client.conversionStatus === 'Converted') acc[entity].conversions++;
    if (client.retentionStatus === 'Retained') acc[entity].retained++;
    acc[entity].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  Object.values(entityStats).forEach((stats: any) => {
    stats.conversionRate = stats.newClients > 0 ? (stats.conversions / stats.newClients) * 100 : 0;
    stats.avgLTV = stats.newClients > 0 ? stats.totalLTV / stats.newClients : 0;
  });

  const entityList = Object.values(entityStats) as any[];

  const sortItems = (items: any[], metric: string) => {
    return [...items].sort((a, b) => {
      const aValue = a[metric] || 0;
      const bValue = b[metric] || 0;
      return viewMode === 'top' ? bValue - aValue : aValue - bValue;
    });
  };

  const handleItemClick = (item: any, type: string) => {
    onItemClick?.({ ...item, type });
  };

  const getCurrentList = () => {
    switch (activeCategory) {
      case 'trainers': return trainerList;
      case 'locations': return locationList;
      case 'memberships': return membershipList;
      case 'entities': return entityList;
    }
  };

  const renderList = (items: any[], type: string, metric: string) => {
    const sortedItems = sortItems(items, metric).slice(0, showCount);
    
    return (
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div 
            key={item.name}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all duration-300 cursor-pointer group hover:shadow-md"
            onClick={() => handleItemClick(item, type)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                viewMode === 'top' 
                  ? index < 3 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                  : index < 3
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm truncate max-w-[150px]" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(item.newClients)} clients • {item.conversionRate.toFixed(1)}% conv
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-gray-800 text-sm">
                  {metric === 'totalLTV' ? formatCurrency(item[metric]) : 
                   metric === 'conversionRate' ? `${item[metric].toFixed(1)}%` :
                   formatNumber(item[metric])}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.avgLTV)} avg LTV
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Performance Rankings & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={activeCategory === 'trainers' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('trainers')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Trainers
            </Button>
            <Button
              variant={activeCategory === 'locations' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('locations')}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Locations
            </Button>
            <Button
              variant={activeCategory === 'memberships' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('memberships')}
              className="gap-2"
            >
              <Award className="w-4 h-4" />
              Memberships
            </Button>
            <Button
              variant={activeCategory === 'entities' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('entities')}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Entities
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Trainers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              {viewMode === 'top' ? 'Top' : 'Bottom'} {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Performance
            </CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 px-3 py-1">
              {getCurrentList().length} {activeCategory}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'top' | 'bottom')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="top" className="text-xs font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="bottom" className="text-xs font-medium">
                <TrendingDown className="w-3 h-3 mr-1" />
                Need Support
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
            {renderList(getCurrentList(), activeCategory.slice(0, -1), 'conversionRate')}
          
            {getCurrentList().length > showCount && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCount(prev => prev + 5)}
                className="w-full text-xs hover:bg-blue-50"
              >
                <Eye className="w-3 h-3 mr-1" />
                  Show More {activeCategory}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </motion.div>

      {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Insights
            </CardTitle>
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 px-3 py-1">
              Analytics
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                <div className="text-sm text-blue-700">Total Clients</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {((data.filter(c => c.conversionStatus === 'Converted').length / data.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Conversion Rate</div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-2">Key Insights</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Top performing {activeCategory} drive {((getCurrentList().slice(0, 3).reduce((sum, item) => sum + item.conversionRate, 0) / 3) || 0).toFixed(1)}% avg conversion</li>
                <li>• Average LTV across top performers: {formatCurrency((getCurrentList().slice(0, 3).reduce((sum, item) => sum + item.avgLTV, 0) / 3) || 0)}</li>
                <li>• Performance gap between top and bottom: {((getCurrentList()[0]?.conversionRate || 0) - (getCurrentList()[getCurrentList().length - 1]?.conversionRate || 0)).toFixed(1)}%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </motion.div>
      </div>
    </div>
  );
};