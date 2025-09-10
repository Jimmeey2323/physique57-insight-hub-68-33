import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  DollarSign, 
  Target,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface PowerCycleBarreStrengthComparisonProps {
  data: {
    sessions: any[];
    payroll: any[];
    sales: any[];
  };
}

const COLORS = {
  'Power Cycle': '#8B5CF6',
  'Barre': '#06B6D4', 
  'Strength': '#10B981'
};

export const PowerCycleBarreStrengthComparison: React.FC<PowerCycleBarreStrengthComparisonProps> = ({ data }) => {
  // Process session data by class type
  const classComparison = useMemo(() => {
    const sessionsByType = data.sessions.reduce((acc, session) => {
      const classType = session.cleanedClass || 'Unknown';
      
      // Categorize class types
      let category = 'Other';
      if (classType.toLowerCase().includes('cycle') || classType.toLowerCase().includes('spinning')) {
        category = 'Power Cycle';
      } else if (classType.toLowerCase().includes('barre')) {
        category = 'Barre';
      } else if (classType.toLowerCase().includes('strength') || classType.toLowerCase().includes('weights')) {
        category = 'Strength';
      }
      
      if (!acc[category]) {
        acc[category] = {
          category,
          sessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          revenue: 0,
          uniqueInstructors: new Set()
        };
      }
      
      acc[category].sessions += 1;
      acc[category].totalAttendance += session.checkedInCount || 0;
      acc[category].totalCapacity += session.capacity || 0;
      acc[category].uniqueInstructors.add(session.instructor);
      
      return acc;
    }, {} as Record<string, any>);

    // Add revenue data from payroll
    data.payroll.forEach(payroll => {
      if (payroll.cycleSessions > 0) {
        if (!sessionsByType['Power Cycle']) sessionsByType['Power Cycle'] = { category: 'Power Cycle', sessions: 0, totalAttendance: 0, totalCapacity: 0, revenue: 0, uniqueInstructors: new Set() };
        sessionsByType['Power Cycle'].revenue += payroll.cyclePaid || 0;
      }
      if (payroll.barreSessions > 0) {
        if (!sessionsByType['Barre']) sessionsByType['Barre'] = { category: 'Barre', sessions: 0, totalAttendance: 0, totalCapacity: 0, revenue: 0, uniqueInstructors: new Set() };
        sessionsByType['Barre'].revenue += payroll.barrePaid || 0;
      }
      if (payroll.strengthSessions > 0) {
        if (!sessionsByType['Strength']) sessionsByType['Strength'] = { category: 'Strength', sessions: 0, totalAttendance: 0, totalCapacity: 0, revenue: 0, uniqueInstructors: new Set() };
        sessionsByType['Strength'].revenue += payroll.strengthPaid || 0;
      }
    });

    return Object.values(sessionsByType)
      .filter((item: any) => ['Power Cycle', 'Barre', 'Strength'].includes(item.category))
      .map((item: any) => ({
        ...item,
        avgAttendance: item.sessions > 0 ? item.totalAttendance / item.sessions : 0,
        fillRate: item.totalCapacity > 0 ? (item.totalAttendance / item.totalCapacity) * 100 : 0,
        instructorCount: item.uniqueInstructors.size,
        revenuePerSession: item.sessions > 0 ? item.revenue / item.sessions : 0
      }));
  }, [data.sessions, data.payroll]);

  // Performance metrics for each category
  const performanceMetrics = useMemo(() => {
    return classComparison.map(item => ({
      category: item.category,
      sessions: item.sessions,
      attendance: item.totalAttendance,
      avgAttendance: item.avgAttendance,
      fillRate: item.fillRate,
      revenue: item.revenue,
      instructors: item.instructorCount,
      color: COLORS[item.category as keyof typeof COLORS] || '#9CA3AF'
    }));
  }, [classComparison]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                PowerCycle vs Barre vs Strength Analysis
              </span>
              <p className="text-gray-600 font-normal">
                Comprehensive performance comparison across class formats
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => (
          <Card key={metric.category} className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: metric.color }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                  <Activity className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{metric.category}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Sessions</span>
                      <span className="font-bold">{formatNumber(metric.sessions)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Total Attendance</span>
                      <span className="font-bold">{formatNumber(metric.attendance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Avg per Session</span>
                      <span className="font-bold">{metric.avgAttendance.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Fill Rate</span>
                      <span className="font-bold">{formatPercentage(metric.fillRate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Revenue</span>
                      <span className="font-bold">{formatCurrency(metric.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-90">Instructors</span>
                      <span className="font-bold">{metric.instructors}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Comparison */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Sessions & Attendance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#8B5CF6" name="Sessions" />
                <Bar dataKey="attendance" fill="#06B6D4" name="Total Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Comparison */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fill Rate Distribution */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Fill Rate Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.category}: ${formatPercentage(entry.fillRate)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="fillRate"
                >
                  {performanceMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Fill Rate']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary Table */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div 
                  key={metric.category}
                  className="flex items-center justify-between p-4 rounded-lg border-l-4"
                  style={{ borderLeftColor: metric.color, backgroundColor: `${metric.color}10` }}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{metric.category}</h4>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{formatNumber(metric.sessions)} sessions</span>
                      <span>{formatNumber(metric.attendance)} attendees</span>
                      <span>{formatPercentage(metric.fillRate)} fill rate</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(metric.revenue)}</p>
                    <p className="text-sm text-gray-600">{metric.instructors} instructors</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};