import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Clock, UserCheck, Award, UserPlus, ArrowRight, Percent } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionMetricCardsProps {
  data: NewClientData[];
  onCardClick?: (title: string, data: NewClientData[], metricType: string) => void;
}

export const ClientConversionMetricCards: React.FC<ClientConversionMetricCardsProps> = ({ data, onCardClick }) => {
  // Calculate comprehensive metrics
  const totalClients = data.length;
  
  // Count new members - only when isNew contains "New" (case insensitive)
  const newMembers = data.filter(client => {
    const isNewValue = String(client.isNew || '').toLowerCase();
    return isNewValue.includes('new');
  }).length;
  
  const convertedMembers = data.filter(client => client.conversionStatus === 'Converted').length;
  const retainedMembers = data.filter(client => client.retentionStatus === 'Retained').length;
  
  // Corrected: trials completed = clients who actually completed trials (visits post trial > 0)
  const trialsCompleted = data.filter(client => (client.visitsPostTrial || 0) > 0).length;
  
  // Lead to trial conversion: clients who tried vs total new members
  const leadToTrialConversion = newMembers > 0 ? (trialsCompleted / newMembers) * 100 : 0;
  
  // Trial to member conversion: converted from those who tried trials
  const trialToMemberConversion = trialsCompleted > 0 ? (convertedMembers / trialsCompleted) * 100 : 0;
  
  // Overall conversion rate: Converted from new members only
  const overallConversionRate = newMembers > 0 ? (convertedMembers / newMembers) * 100 : 0;
  
  // Retention rate: retained from converted members
  const retentionRate = convertedMembers > 0 ? (retainedMembers / convertedMembers) * 100 : 0;
  
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgLTV = totalClients > 0 ? totalLTV / totalClients : 0;
  
  // Calculate average conversion time from clients who converted
  const convertedClientsWithTime = data.filter(client => 
    client.conversionStatus === 'Converted' && (client.conversionSpan || 0) > 0
  );
  const avgConversionTime = convertedClientsWithTime.length > 0 
    ? convertedClientsWithTime.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / convertedClientsWithTime.length 
    : 0;

  const metrics = [
    {
      title: 'New Members',
      value: formatNumber(newMembers),
      icon: UserPlus,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Recently acquired clients',
      change: '+12.5%',
      isPositive: true,
      metricType: 'new_members',
      filterData: () => data.filter(client => {
        const isNewValue = String(client.isNew || '');
        return isNewValue.includes('New');
      })
    },
    {
      title: 'Converted Members',
      value: formatNumber(convertedMembers),
      icon: Award,
      gradient: 'from-green-500 to-teal-600',
      description: 'Trial to paid conversions',
      change: '+8.3%',
      isPositive: true,
      metricType: 'converted_members',
      filterData: () => data.filter(client => client.conversionStatus === 'Converted')
    },
    {
      title: 'Retained Members',
      value: formatNumber(retainedMembers),
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Active retained clients',
      change: '+15.2%',
      isPositive: true,
      metricType: 'retained_members',
      filterData: () => data.filter(client => client.retentionStatus === 'Retained')
    },
    {
      title: 'Conversion Rate',
      value: `${overallConversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600',
      description: 'New to converted rate',
      change: '+4.8%',
      isPositive: true,
      metricType: 'conversion_rate',
      filterData: () => data.filter(client => {
        const isNewValue = String(client.isNew || '');
        return isNewValue.includes('New') || client.conversionStatus === 'Converted';
      })
    },
    {
      title: 'Retention Rate',
      value: `${retentionRate.toFixed(1)}%`,
      icon: Target,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Member retention rate',
      change: '+3.1%',
      isPositive: true,
      metricType: 'retention_rate',
      filterData: () => data.filter(client => client.conversionStatus === 'Converted' || client.retentionStatus === 'Retained')
    },
    {
      title: 'Avg LTV',
      value: formatCurrency(avgLTV),
      icon: DollarSign,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Average lifetime value',
      change: '+7.2%',
      isPositive: true,
      metricType: 'avg_ltv',
      filterData: () => data.filter(client => (client.ltv || 0) > 0)
    },
    {
      title: 'Avg Conv. Time',
      value: `${avgConversionTime.toFixed(0)} days`,
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
      description: 'Average conversion time',
      change: '-2.1 days',
      isPositive: true,
      metricType: 'avg_conv_time',
      filterData: () => data.filter(client => 
        client.conversionStatus === 'Converted' && (client.conversionSpan || 0) > 0
      )
    },
    {
      title: 'Trial → Member',
      value: `${trialToMemberConversion.toFixed(1)}%`,
      icon: ArrowRight,
      gradient: 'from-indigo-500 to-purple-600',
      description: 'Trial conversion rate',
      change: '+5.4%',
      isPositive: true,
      metricType: 'trial_to_member',
      filterData: () => data.filter(client => (client.visitsPostTrial || 0) > 0)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.title} 
          className="group relative overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onCardClick?.(metric.title, metric.filterData(), metric.metricType)}
        >
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <CardContent className="relative p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-md group-hover:shadow-lg transition-all duration-300`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <Badge 
                className={`text-xs px-2 py-1 font-medium transition-all duration-300 ${
                  metric.isPositive 
                    ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200' 
                    : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                }`}
              >
                {metric.change}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 group-hover:text-gray-800 transition-colors">
                {metric.title}
              </h3>
              <p className={`text-2xl font-bold text-transparent bg-gradient-to-r ${metric.gradient} bg-clip-text group-hover:scale-105 transition-transform duration-300`}>
                {metric.value}
              </p>
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${metric.gradient} animate-pulse`}></div>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  {metric.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};