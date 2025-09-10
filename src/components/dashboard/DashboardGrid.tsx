import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  Clock, 
  BarChart3,
  Target,
  Activity
} from 'lucide-react';

interface DashboardGridProps {
  onButtonClick: (sectionId: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onButtonClick }) => {
  const dashboardSections = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'High-level business metrics and KPIs',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'sales-analytics',
      title: 'Sales Analytics',
      description: 'Revenue trends and sales performance',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'class-attendance',
      title: 'Class Attendance',
      description: 'Session attendance and capacity analysis',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'trainer-performance',
      title: 'Trainer Performance',
      description: 'Individual trainer metrics and rankings',
      icon: UserCheck,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700'
    },
    {
      id: 'client-retention',
      title: 'Client Retention',
      description: 'Member retention and conversion analysis',
      icon: Target,
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700'
    },
    {
      id: 'discounts-promotions',
      title: 'Discounts & Promotions',
      description: 'Discount analysis and promotional effectiveness',
      icon: BarChart3,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700'
    },
    {
      id: 'funnel-leads',
      title: 'Funnel & Leads',
      description: 'Lead conversion and sales funnel analysis',
      icon: Activity,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      id: 'class-performance-series',
      title: 'Class Performance Series',
      description: 'Detailed class format performance analysis',
      icon: Calendar,
      color: 'from-cyan-500 to-cyan-600',
      hoverColor: 'hover:from-cyan-600 hover:to-cyan-700'
    },
    {
      id: 'late-cancellations',
      title: 'Late Cancellations',
      description: 'Analysis of late cancellations and no-shows',
      icon: Clock,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      id: 'powercycle-vs-barre',
      title: 'PowerCycle vs Barre',
      description: 'Comparative analysis of PowerCycle, Barre, and Strength classes',
      icon: Activity,
      color: 'from-violet-500 to-violet-600',
      hoverColor: 'hover:from-violet-600 hover:to-violet-700'
    },
    {
      id: 'expiration-analytics',
      title: 'Expirations & Churn',
      description: 'Membership expirations and customer retention analysis',
      icon: Calendar,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboardSections.map((section) => {
        const IconComponent = section.icon;
        return (
          <Card 
            key={section.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border border-gray-200 overflow-hidden"
            onClick={() => onButtonClick(section.id)}
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} ${section.hoverColor} flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Active
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};