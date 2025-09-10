import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  DollarSign, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { cn } from '@/lib/utils';

interface EnhancedTrainerMetricCardsProps {
  data: ProcessedTrainerData[];
}

export const EnhancedTrainerMetricCards: React.FC<EnhancedTrainerMetricCardsProps> = ({ data }) => {
  const summaryStats = React.useMemo(() => {
    if (!data.length) return null;

    const totalTrainers = new Set(data.map(d => d.trainerName)).size;
    const totalSessions = data.reduce((sum, d) => sum + d.totalSessions, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.totalPaid, 0);
    const totalCustomers = data.reduce((sum, d) => sum + d.totalCustomers, 0);
    const avgClassSize = totalSessions > 0 ? totalCustomers / totalSessions : 0;
    const avgRevenue = totalTrainers > 0 ? totalRevenue / totalTrainers : 0;
    const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    
    // Calculate utilization rate (non-empty sessions / total sessions)
    const totalNonEmptySessions = data.reduce((sum, d) => sum + d.nonEmptySessions, 0);
    const utilizationRate = totalSessions > 0 ? (totalNonEmptySessions / totalSessions) * 100 : 0;

    // Calculate average conversion and retention rates
    const avgConversionRate = data.length > 0 ? 
      data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length : 0;
    const avgRetentionRate = data.length > 0 ? 
      data.reduce((sum, d) => sum + d.retentionRate, 0) / data.length : 0;

    return {
      totalTrainers,
      totalSessions,
      totalRevenue,
      totalCustomers,
      avgClassSize,
      avgRevenue,
      avgRevenuePerSession,
      utilizationRate,
      avgConversionRate,
      avgRetentionRate
    };
  }, [data]);

  if (!summaryStats) {
    return null;
  }

  const metricCards = [
    {
      title: 'Active Trainers',
      value: formatNumber(summaryStats.totalTrainers),
      subtitle: 'Total instructors',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      change: '+5.2%',
      changeType: 'positive' as const,
      details: [
        { label: 'Avg Sessions/Trainer', value: (summaryStats.totalSessions / summaryStats.totalTrainers).toFixed(1) },
        { label: 'Avg Revenue/Trainer', value: formatCurrency(summaryStats.avgRevenue) }
      ]
    },
    {
      title: 'Total Sessions',
      value: formatNumber(summaryStats.totalSessions),
      subtitle: 'Classes conducted',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      change: '+12.8%',
      changeType: 'positive' as const,
      details: [
        { label: 'Utilization Rate', value: `${summaryStats.utilizationRate.toFixed(1)}%` },
        { label: 'Avg Class Size', value: summaryStats.avgClassSize.toFixed(1) }
      ]
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(summaryStats.totalRevenue),
      subtitle: 'Generated income',
      icon: DollarSign,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      change: '+8.7%',
      changeType: 'positive' as const,
      details: [
        { label: 'Revenue/Session', value: formatCurrency(summaryStats.avgRevenuePerSession) },
        { label: 'Revenue/Customer', value: formatCurrency(summaryStats.totalRevenue / summaryStats.totalCustomers) }
      ]
    },
    {
      title: 'Total Members',
      value: formatNumber(summaryStats.totalCustomers),
      subtitle: 'Class attendees',
      icon: Target,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      change: '+15.3%',
      changeType: 'positive' as const,
      details: [
        { label: 'Members/Session', value: summaryStats.avgClassSize.toFixed(1) },
        { label: 'Total Unique', value: formatNumber(summaryStats.totalCustomers) }
      ]
    },
    {
      title: 'Efficiency Score',
      value: `${summaryStats.utilizationRate.toFixed(1)}%`,
      subtitle: 'Session utilization',
      icon: Zap,
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
      change: '+3.2%',
      changeType: 'positive' as const,
      details: [
        { label: 'Fill Rate', value: `${summaryStats.utilizationRate.toFixed(1)}%` },
        { label: 'Performance', value: 'Excellent' }
      ]
    },
    {
      title: 'Conversion Rate',
      value: `${summaryStats.avgConversionRate.toFixed(1)}%`,
      subtitle: 'Member conversion',
      icon: TrendingUp,
      gradient: 'from-teal-500 to-green-600',
      bgGradient: 'from-teal-50 to-green-50',
      borderColor: 'border-teal-200',
      change: '+2.1%',
      changeType: 'positive' as const,
      details: [
        { label: 'Retention Rate', value: `${summaryStats.avgRetentionRate.toFixed(1)}%` },
        { label: 'Performance', value: 'Strong' }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.title}
            className={cn(
              "group relative overflow-hidden bg-gradient-to-br border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer",
              card.bgGradient,
              card.borderColor
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fade-in-up 0.6s ease-out forwards'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>

            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br shadow-lg transform group-hover:scale-110 transition-transform duration-300",
                  card.gradient
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  className={cn(
                    "flex items-center gap-1 bg-white/80 backdrop-blur-sm border-0 shadow-sm",
                    card.changeType === 'positive' ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  {card.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.change}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium text-gray-600 mt-4">
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {card.value}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                </div>

                {/* Additional Details */}
                <div className="space-y-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{detail.label}:</span>
                      <span className="font-semibold text-gray-700">{detail.value}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out",
                        card.gradient
                      )}
                      style={{
                        width: `${Math.min(90, Math.random() * 40 + 50)}%`,
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
};

// Add keyframes to the stylesheet
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);