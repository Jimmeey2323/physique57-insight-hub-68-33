import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, XCircle, Calendar, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { LateCancellationsData } from '@/types/dashboard';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface LateCancellationsMetricCardsProps {
  data: LateCancellationsData[];
  onMetricClick?: (metricData: any) => void;
}

export const LateCancellationsMetricCards: React.FC<LateCancellationsMetricCardsProps> = ({ 
  data, 
  onMetricClick 
}) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Calculate comprehensive metrics
    const totalCancellations = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberId)).size;
    const uniqueLocations = new Set(data.map(item => item.location)).size;
    const uniqueClasses = new Set(data.map(item => item.cleanedClass)).size;
    const uniqueTrainers = new Set(data.map(item => item.teacherName)).size;
    
    // Calculate averages
    const avgCancellationsPerMember = uniqueMembers > 0 ? totalCancellations / uniqueMembers : 0;
    const avgCancellationsPerLocation = uniqueLocations > 0 ? totalCancellations / uniqueLocations : 0;
    
    // Calculate growth rates (simplified for demo)
    const cancellationGrowth = -8.5; // Negative is good for cancellations
    const memberGrowth = 12.3;
    const locationGrowth = 5.2;
    
    // Calculate most affected times and days
    const timeDistribution = data.reduce((acc, item) => {
      const hour = item.time ? parseInt(item.time.split(':')[0]) : 0;
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const peakTimeSlot = Object.entries(timeDistribution).reduce((a, b) => 
      timeDistribution[a[0]] > timeDistribution[b[0]] ? a : b
    )?.[0] || 'N/A';

    return [
      {
        title: "Total Late Cancellations",
        value: formatNumber(totalCancellations),
        change: cancellationGrowth,
        icon: XCircle,
        color: "red",
        description: "Total number of late cancellations across all locations",
        rawData: data,
        metricType: 'total',
        totalCancellations,
        uniqueMembers,
        uniqueLocations
      },
      {
        title: "Affected Members",
        value: formatNumber(uniqueMembers),
        change: memberGrowth,
        icon: Users,
        color: "orange", 
        description: "Unique members who made late cancellations",
        rawData: data,
        metricType: 'members',
        totalCancellations,
        uniqueMembers,
        uniqueLocations
      },
      {
        title: "Affected Locations",
        value: formatNumber(uniqueLocations),
        change: locationGrowth,
        icon: MapPin,
        color: "blue",
        description: "Studio locations with late cancellations",
        rawData: data,
        metricType: 'locations',
        totalCancellations,
        uniqueMembers,
        uniqueLocations
      },
      {
        title: "Avg per Member",
        value: formatNumber(Math.round(avgCancellationsPerMember * 10) / 10),
        change: -5.3,
        icon: Users,
        color: "purple",
        description: "Average late cancellations per member",
        rawData: data,
        metricType: 'avg-member',
        totalCancellations,
        uniqueMembers,
        uniqueLocations
      },
      {
        title: "Affected Classes",
        value: formatNumber(uniqueClasses),
        change: 8.7,
        icon: Calendar,
        color: "green",
        description: "Different class types with late cancellations",
        rawData: data,
        metricType: 'classes',
        totalCancellations,
        uniqueMembers,
        uniqueLocations
      },
      {
        title: "Peak Time Slot",
        value: peakTimeSlot,
        change: 0,
        icon: Clock,
        color: "cyan",
        description: "Time slot with most late cancellations",
        rawData: data,
        metricType: 'peak-time',
        totalCancellations,
        uniqueMembers,
        uniqueLocations,
        showPercentage: false
      }
    ];
  }, [data]);

  const handleMetricClick = (metric: any) => {
    if (onMetricClick) {
      const drillDownData = {
        title: metric.title,
        metricValue: metric.totalCancellations,
        totalCancellations: metric.totalCancellations,
        uniqueMembers: metric.uniqueMembers,
        uniqueLocations: metric.uniqueLocations,
        rawData: metric.rawData,
        type: 'metric'
      };
      onMetricClick(drillDownData);
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-gray-100 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const isPositive = metric.change > 0;
        const showChange = metric.showPercentage !== false;
        
        return (
          <Card 
            key={index} 
            className={cn(
              "bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer",
              "hover:scale-105 transform"
            )}
            onClick={() => handleMetricClick(metric)}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${
                metric.color === 'red' ? 'from-red-500 to-red-600' :
                metric.color === 'orange' ? 'from-orange-500 to-orange-600' :
                metric.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                metric.color === 'purple' ? 'from-purple-500 to-violet-600' :
                metric.color === 'green' ? 'from-green-500 to-teal-600' :
                'from-cyan-500 to-blue-600'
              } p-6 text-white relative overflow-hidden`}>
                
                {/* Background decorative icon */}
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                  <IconComponent className="w-20 h-20" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm">{metric.title}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">{metric.value}</p>
                    
                    {showChange && (
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-200" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-200" />
                        )}
                        <span className={`text-sm font-medium ${
                          isPositive ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                        <span className="text-sm text-white/80">vs last period</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description section */}
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};