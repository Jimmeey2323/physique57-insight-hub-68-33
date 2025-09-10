import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Target, TrendingUp, Star, Clock, Activity, Zap } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { ClassAttendanceDrillDownModal } from './ClassAttendanceDrillDownModal';

interface ClassAttendanceMetricCardsProps {
  data: SessionData[];
}

interface DrillDownData {
  type: 'total-sessions' | 'total-attendance' | 'average-attendance' | 'fill-rate' | 'class-formats' | 'revenue-per-session';
  title: string;
  value: string | number;
  sessionsData: SessionData[];
}

export const ClassAttendanceMetricCards: React.FC<ClassAttendanceMetricCardsProps> = ({ data }) => {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Count ALL sessions - both empty and non-empty
    const totalSessions = data.length;
    const totalAttendance = data.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = data.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalRevenue = data.reduce((sum, session) => sum + (session.revenue || session.totalPaid || 0), 0);
    const uniqueClasses = [...new Set(data.map(session => session.cleanedClass || session.classType).filter(Boolean))].length;
    const uniqueTrainers = [...new Set(data.map(session => session.trainerName).filter(Boolean))].length;
    
    // Count empty vs non-empty sessions
    const emptySessions = data.filter(session => (session.checkedInCount || 0) === 0).length;
    const nonEmptySessions = totalSessions - emptySessions;
    
    const avgAttendance = totalSessions > 0 ? (totalAttendance / totalSessions) : 0;
    const fillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const avgRevenue = totalSessions > 0 ? (totalRevenue / totalSessions) : 0;

    // Find best performing class by average attendance
    const classPerformance = data.reduce((acc, session) => {
      const className = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[className]) {
        acc[className] = { totalAttendance: 0, sessionCount: 0 };
      }
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].sessionCount += 1;
      return acc;
    }, {} as Record<string, { totalAttendance: number; sessionCount: number }>);

    const bestClass = Object.entries(classPerformance)
      .map(([name, stats]) => ({
        name,
        avgAttendance: stats.totalAttendance / stats.sessionCount
      }))
      .sort((a, b) => b.avgAttendance - a.avgAttendance)[0];

    return {
      totalSessions,
      totalAttendance,
      avgAttendance,
      fillRate,
      avgRevenue,
      totalRevenue,
      uniqueClasses,
      uniqueTrainers,
      bestClass,
      emptySessions,
      nonEmptySessions
    };
  }, [data]);

  if (!metrics) return null;

  const handleCardClick = (type: DrillDownData['type'], title: string, value: string | number) => {
    setDrillDownData({
      type,
      title,
      value,
      sessionsData: data
    });
  };

  const cards = [
    {
      title: 'Total Sessions',
      value: formatNumber(metrics.totalSessions),
      icon: Calendar,
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: `${formatNumber(metrics.nonEmptySessions)} with attendance • ${formatNumber(metrics.emptySessions)} empty`,
      trend: '+12.3%',
      iconBg: 'bg-blue-100',
      onClick: () => handleCardClick('total-sessions', 'Total Sessions', metrics.totalSessions)
    },
    {
      title: 'Total Attendance',
      value: formatNumber(metrics.totalAttendance),
      icon: Users,
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      description: 'Total participants checked-in',
      trend: '+8.7%',
      iconBg: 'bg-green-100',
      onClick: () => handleCardClick('total-attendance', 'Total Attendance', metrics.totalAttendance)
    },
    {
      title: 'Average Attendance',
      value: formatNumber(metrics.avgAttendance),
      icon: Target,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      description: 'Per session average',
      trend: '+5.2%',
      iconBg: 'bg-purple-100',
      onClick: () => handleCardClick('average-attendance', 'Average Attendance', metrics.avgAttendance)
    },
    {
      title: 'Fill Rate',
      value: formatPercentage(metrics.fillRate),
      icon: TrendingUp,
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      description: 'Capacity utilization rate',
      trend: '+3.1%',
      iconBg: 'bg-orange-100',
      onClick: () => handleCardClick('fill-rate', 'Fill Rate', metrics.fillRate)
    },
    {
      title: 'Class Formats',
      value: formatNumber(metrics.uniqueClasses),
      icon: Star,
      gradient: 'from-indigo-600 to-blue-600',
      bgGradient: 'from-indigo-50 to-blue-50',
      description: 'Unique class formats offered',
      trend: '+2',
      iconBg: 'bg-indigo-100',
      onClick: () => handleCardClick('class-formats', 'Class Formats', metrics.uniqueClasses)
    },
    {
      title: 'Revenue Per Session',
      value: formatCurrency(metrics.avgRevenue),
      icon: Zap,
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      description: 'Average revenue generated',
      trend: '+15.4%',
      iconBg: 'bg-emerald-100',
      onClick: () => handleCardClick('revenue-per-session', 'Revenue Per Session', metrics.avgRevenue)
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] cursor-pointer animate-fade-in"
            onClick={card.onClick}
            style={{ animationDelay: `${index * 100}ms` }}
          >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
          
          {/* Animated Border */}
          <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-30 rounded-2xl blur-sm transition-all duration-700`}></div>
          
          {/* Floating Glow Effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-700`}></div>
          
          <CardContent className="relative p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${card.iconBg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                <card.icon className={`w-6 h-6 text-transparent bg-gradient-to-r ${card.gradient} bg-clip-text group-hover:animate-pulse`} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-white/60 backdrop-blur-sm border-white/20 group-hover:bg-white/80 transition-colors"
                >
                  Live
                </Badge>
                <Badge 
                  className={`text-xs bg-gradient-to-r ${card.gradient} text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                >
                  {card.trend}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors">
                  {card.title}
                </h3>
                <p className={`text-3xl font-bold text-transparent bg-gradient-to-r ${card.gradient} bg-clip-text mt-2`}>
                  {card.value}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${card.gradient}`}></div>
                <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Floating Elements with Animation */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm group-hover:animate-float"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm group-hover:animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-white/40 to-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm transform -translate-x-1/2 -translate-y-1/2 group-hover:animate-sparkle"></div>
          </CardContent>
          </Card>
        ))}
      </div>

      {/* Drill-down Modal */}
      {drillDownData && (
        <ClassAttendanceDrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          classFormat={drillDownData.title}
          sessionsData={drillDownData.sessionsData}
          overallStats={{
            totalSessions: metrics?.totalSessions || 0,
            totalCapacity: data.reduce((sum, session) => sum + (session.capacity || 0), 0),
            totalCheckedIn: metrics?.totalAttendance || 0,
            totalRevenue: metrics?.totalRevenue || 0,
            fillRate: metrics?.fillRate || 0,
            showUpRate: 0,
            avgRevenue: metrics?.avgRevenue || 0,
            emptySessions: metrics?.emptySessions || 0
          }}
        />
      )}
    </>
  );
};