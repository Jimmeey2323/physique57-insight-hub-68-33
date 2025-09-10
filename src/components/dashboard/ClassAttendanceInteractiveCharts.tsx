import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Calendar, Target, Users, DollarSign } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface ClassAttendanceInteractiveChartsProps {
  data: SessionData[];
}

const COLORS = ['#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4', '#EF4444', '#84CC16'];

export const ClassAttendanceInteractiveCharts: React.FC<ClassAttendanceInteractiveChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState('overview');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { 
      overview: [], 
      classFormats: [], 
      dailyTrends: [], 
      utilization: [],
      monthlyTrends: [],
      revenueAnalysis: []
    };

    // Overview data - Fill rate and utilization by class format
    const formatStats = data.reduce((acc, session) => {
      const format = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[format]) {
        acc[format] = {
          format,
          totalSessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          emptySessions: 0
        };
      }
      
      acc[format].totalSessions += 1;
      acc[format].totalCapacity += session.capacity || 0;
      acc[format].totalCheckedIn += session.checkedInCount || 0;
      acc[format].totalRevenue += session.totalPaid || 0;
      if ((session.checkedInCount || 0) === 0) acc[format].emptySessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const overview = Object.values(formatStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.totalCapacity > 0 ? (stat.totalCheckedIn / stat.totalCapacity) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      avgRevenue: stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0
    })).sort((a, b) => b.totalSessions - a.totalSessions);

    // Class formats pie chart
    const classFormats = overview.map(item => ({
      name: item.format,
      value: item.totalSessions,
      attendance: item.totalCheckedIn
    }));

    // Daily trends
    const dailyStats = data.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      if (!acc[day]) {
        acc[day] = {
          day,
          sessions: 0,
          attendance: 0,
          capacity: 0,
          revenue: 0
        };
      }
      
      acc[day].sessions += 1;
      acc[day].attendance += session.checkedInCount || 0;
      acc[day].capacity += session.capacity || 0;
      acc[day].revenue += session.totalPaid || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const dailyTrends = Object.values(dailyStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.capacity > 0 ? (stat.attendance / stat.capacity) * 100 : 0
    }));

    // Utilization analysis
    const utilizationData = overview.map(item => ({
      format: item.format,
      utilized: item.totalSessions - item.emptySessions,
      empty: item.emptySessions,
      utilizationRate: item.utilizationRate
    }));

    // Monthly trends
    const monthlyStats = data.reduce((acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          sessions: 0,
          attendance: 0,
          capacity: 0,
          revenue: 0,
          emptySessions: 0
        };
      }
      
      acc[monthKey].sessions += 1;
      acc[monthKey].attendance += session.checkedInCount || 0;
      acc[monthKey].capacity += session.capacity || 0;
      acc[monthKey].revenue += session.totalPaid || 0;
      if ((session.checkedInCount || 0) === 0) acc[monthKey].emptySessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.capacity > 0 ? (stat.attendance / stat.capacity) * 100 : 0,
      utilizationRate: stat.sessions > 0 ? ((stat.sessions - stat.emptySessions) / stat.sessions) * 100 : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Revenue analysis
    const revenueAnalysis = overview.map(item => ({
      format: item.format,
      totalRevenue: item.totalRevenue,
      avgRevenue: item.avgRevenue,
      revenuePerAttendee: item.totalCheckedIn > 0 ? item.totalRevenue / item.totalCheckedIn : 0
    }));

    return {
      overview,
      classFormats,
      dailyTrends,
      utilization: utilizationData,
      monthlyTrends,
      revenueAnalysis
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.name.includes('Rate') || entry.name.includes('Percentage') 
                  ? formatPercentage(entry.value)
                  : entry.name.includes('Revenue') 
                    ? formatCurrency(entry.value)
                    : formatNumber(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartButtons = [
    { id: 'overview', label: 'Performance Overview', icon: BarChart3, color: 'blue' },
    { id: 'formats', label: 'Class Distribution', icon: PieChartIcon, color: 'purple' },
    { id: 'trends', label: 'Daily Patterns', icon: TrendingUp, color: 'green' },
    { id: 'utilization', label: 'Utilization Analysis', icon: Activity, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {chartButtons.map((button) => {
              const Icon = button.icon;
              return (
                <Button
                  key={button.id}
                  variant={activeChart === button.id ? 'default' : 'outline'}
                  onClick={() => setActiveChart(button.id)}
                  className="gap-2 transition-all duration-200 hover:scale-105"
                >
                  <Icon className="w-4 h-4" />
                  {button.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      {activeChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Fill Rate by Class Format
                <Badge variant="outline" className="text-blue-600">
                  Capacity Utilization
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.overview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="fillRate" fill="#3B82F6" name="Fill Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Total Attendance by Format
                <Badge variant="outline" className="text-green-600">
                  Participation
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.overview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalCheckedIn" fill="#10B981" name="Total Attendance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeChart === 'formats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                Sessions Distribution
                <Badge variant="outline" className="text-purple-600">
                  By Class Format
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.classFormats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.classFormats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Utilization vs Empty Sessions
                <Badge variant="outline" className="text-indigo-600">
                  Efficiency
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.utilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="utilized" stackId="a" fill="#10B981" name="Utilized Sessions" />
                  <Bar dataKey="empty" stackId="a" fill="#EF4444" name="Empty Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeChart === 'trends' && (
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Weekly Performance Patterns
                <Badge variant="outline" className="text-green-600">
                  Day-wise Analysis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sessions" fill="#3B82F6" name="Total Sessions" />
                  <Bar yAxisId="left" dataKey="attendance" fill="#10B981" name="Total Attendance" />
                  <Line yAxisId="right" type="monotone" dataKey="fillRate" stroke="#EC4899" strokeWidth={3} name="Fill Rate %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeChart === 'utilization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Monthly Trends
                <Badge variant="outline" className="text-orange-600">
                  Performance Over Time
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sessions" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Sessions" />
                  <Area type="monotone" dataKey="attendance" stackId="2" stroke="#10B981" fill="#10B981" name="Attendance" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Revenue by Format
                <Badge variant="outline" className="text-green-600">
                  Financial Performance
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.revenueAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalRevenue" fill="#F59E0B" name="Total Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};