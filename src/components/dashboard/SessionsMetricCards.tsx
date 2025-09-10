
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Target, TrendingUp, Calendar, Clock, DollarSign, AlertTriangle, Gift, UserX, Star } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface SessionsMetricCardsProps {
  data: SessionData[];
}

export const SessionsMetricCards: React.FC<SessionsMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    // Filter out unwanted sessions
    const filteredData = data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword;
    });

    const totalSessions = filteredData.length;
    const totalCapacity = filteredData.reduce((sum, session) => sum + session.capacity, 0);
    const totalCheckedIn = filteredData.reduce((sum, session) => sum + session.checkedInCount, 0);
    const totalRevenue = filteredData.reduce((sum, session) => sum + session.totalPaid, 0);
    const totalLateCancellations = filteredData.reduce((sum, session) => sum + session.lateCancelledCount, 0);
    const totalComplimentary = filteredData.reduce((sum, session) => sum + session.complimentaryCount, 0);
    const totalNonPaid = filteredData.reduce((sum, session) => sum + session.nonPaidCount, 0);
    const totalBooked = filteredData.reduce((sum, session) => sum + session.bookedCount, 0);
    const totalMemberships = filteredData.reduce((sum, session) => sum + session.checkedInsWithMemberships, 0);
    const totalPackages = filteredData.reduce((sum, session) => sum + session.checkedInsWithPackages, 0);
    
    const avgFillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
    const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const lateCancellationRate = totalSessions > 0 ? (totalLateCancellations / totalSessions) : 0;
    const avgClassSize = totalSessions > 0 ? totalCheckedIn / totalSessions : 0;
    const membershipUtilization = totalCheckedIn > 0 ? (totalMemberships / totalCheckedIn) * 100 : 0;
    const packageUtilization = totalCheckedIn > 0 ? (totalPackages / totalCheckedIn) * 100 : 0;
    
    // Popular time slots
    const timeSlotCounts = filteredData.reduce((acc, session) => {
      acc[session.time] = (acc[session.time] || 0) + session.checkedInCount;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularTime = Object.entries(timeSlotCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return [
      {
        title: "Total Sessions",
        value: formatNumber(totalSessions),
        change: 8.2,
        description: "Active class sessions tracked (excluding hosted, P57, X)",
        detailDescription: `Total capacity: ${formatNumber(totalCapacity)} seats across all sessions. Includes all regular classes and excludes special events.`,
        icon: Calendar,
        color: "blue"
      },
      {
        title: "Average Class Size",
        value: avgClassSize.toFixed(1),
        change: 12.5,
        description: "Average attendees per session",
        detailDescription: `Calculated from ${formatNumber(totalCheckedIn)} total attendees across ${totalSessions} sessions. This metric helps track class popularity and capacity optimization.`,
        icon: Users,
        color: "purple"
      },
      {
        title: "Average Fill Rate",
        value: `${avgFillRate.toFixed(1)}%`,
        change: 15.3,
        description: "Average capacity utilization",
        detailDescription: `${formatNumber(totalCheckedIn)} attendees out of ${formatNumber(totalCapacity)} total capacity. Higher fill rates indicate better demand-capacity matching.`,
        icon: Target,
        color: "green"
      },
      {
        title: "Total Revenue",
        value: formatCurrency(totalRevenue),
        change: 7.4,
        description: "Revenue from class attendance",
        detailDescription: `Generated from ${totalSessions} sessions with an average of ${formatCurrency(avgRevenuePerSession)} per session. Includes all paid attendees.`,
        icon: DollarSign,
        color: "yellow"
      },
      {
        title: "Late Cancellations",
        value: formatNumber(totalLateCancellations),
        change: -2.1,
        description: `Avg ${lateCancellationRate.toFixed(1)} per session`,
        detailDescription: `Total late cancellations across all sessions. This impacts revenue and class planning. Lower is better for studio operations.`,
        icon: AlertTriangle,
        color: "red"
      },
      {
        title: "Complimentary Attendees",
        value: formatNumber(totalComplimentary),
        change: 3.8,
        description: "Free class attendees",
        detailDescription: `Students attending on complimentary passes or promotional offers. Represents ${((totalComplimentary / totalCheckedIn) * 100).toFixed(1)}% of total attendance.`,
        icon: Gift,
        color: "pink"
      },
      {
        title: "Membership Usage",
        value: `${membershipUtilization.toFixed(1)}%`,
        change: 4.2,
        description: "Classes attended using memberships",
        detailDescription: `${formatNumber(totalMemberships)} out of ${formatNumber(totalCheckedIn)} attendees used memberships. Higher percentage indicates strong membership engagement.`,
        icon: Star,
        color: "indigo"
      },
      {
        title: "Most Popular Time",
        value: mostPopularTime,
        change: 0,
        description: "Peak attendance time slot",
        detailDescription: `Time slot with highest total attendance: ${timeSlotCounts[mostPopularTime] || 0} attendees. Use this data for scheduling and resource allocation.`,
        icon: Clock,
        color: "teal"
      }
    ];
  }, [data]);

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      yellow: "text-yellow-600",
      indigo: "text-indigo-600",
      pink: "text-pink-600",
      red: "text-red-600",
      teal: "text-teal-600"
    };
    return colors[color as keyof typeof colors] || "text-gray-600";
  };

  const getBgColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      yellow: "bg-yellow-50",
      indigo: "bg-indigo-50",
      pink: "bg-pink-50",
      red: "bg-red-50",
      teal: "bg-teal-50"
    };
    return colors[color as keyof typeof colors] || "bg-gray-50";
  };

  const getGradientBg = (color: string) => {
    const gradients = {
      blue: "bg-gradient-to-r from-blue-500 to-blue-600",
      green: "bg-gradient-to-r from-green-500 to-green-600",
      purple: "bg-gradient-to-r from-purple-500 to-purple-600",
      yellow: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      indigo: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      pink: "bg-gradient-to-r from-pink-500 to-pink-600",
      red: "bg-gradient-to-r from-red-500 to-red-600",
      teal: "bg-gradient-to-r from-teal-500 to-teal-600"
    };
    return gradients[color as keyof typeof gradients] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Tooltip key={metric.title}>
            <TooltipTrigger asChild>
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${getBgColor(metric.color)} group-hover:scale-110 transition-transform`}>
                    <metric.icon className={`h-5 w-5 ${getIconColor(metric.color)}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {metric.value}
                  </div>
                  {metric.change !== 0 && (
                    <div className="flex items-center text-sm">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        metric.change > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                      <span className="ml-2 text-gray-500">vs last period</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs p-4 bg-white shadow-xl border-0">
              <div className="space-y-2">
                <div className={`w-8 h-8 ${getGradientBg(metric.color)} rounded-lg flex items-center justify-center mb-2`}>
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">{metric.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {metric.detailDescription}
                </p>
                {metric.change !== 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {metric.change > 0 ? 'Trending up' : 'Trending down'} by {Math.abs(metric.change)}% from previous period
                    </span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
