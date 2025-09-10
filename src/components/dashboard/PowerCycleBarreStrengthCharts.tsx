import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, Zap, Dumbbell } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { PayrollData } from '@/types/dashboard';

interface PowerCycleBarreStrengthChartsProps {
  data: PayrollData[];
}

const COLORS = ['#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4'];

export const PowerCycleBarreStrengthCharts: React.FC<PowerCycleBarreStrengthChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState('comparison');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { comparison: [], monthly: [], trainers: [] };

    // Comparison data
    const totals = data.reduce((acc, item) => {
      acc.powerCycle.sessions += item.cycleSessions || 0;
      acc.powerCycle.customers += item.cycleCustomers || 0;
      acc.powerCycle.revenue += item.cyclePaid || 0;
      acc.powerCycle.emptySessions += item.emptyCycleSessions || 0;

      acc.barre.sessions += item.barreSessions || 0;
      acc.barre.customers += item.barreCustomers || 0;
      acc.barre.revenue += item.barrePaid || 0;
      acc.barre.emptySessions += item.emptyBarreSessions || 0;

      acc.strength.sessions += item.strengthSessions || 0;
      acc.strength.customers += item.strengthCustomers || 0;
      acc.strength.revenue += item.strengthPaid || 0;
      acc.strength.emptySessions += item.emptyStrengthSessions || 0;

      return acc;
    }, {
      powerCycle: { sessions: 0, customers: 0, revenue: 0, emptySessions: 0 },
      barre: { sessions: 0, customers: 0, revenue: 0, emptySessions: 0 },
      strength: { sessions: 0, customers: 0, revenue: 0, emptySessions: 0 }
    });

    const comparisonData = [
      { name: 'PowerCycle', sessions: totals.powerCycle.sessions, customers: totals.powerCycle.customers, revenue: totals.powerCycle.revenue, emptySessions: totals.powerCycle.emptySessions },
      { name: 'Barre', sessions: totals.barre.sessions, customers: totals.barre.customers, revenue: totals.barre.revenue, emptySessions: totals.barre.emptySessions },
      { name: 'Strength', sessions: totals.strength.sessions, customers: totals.strength.customers, revenue: totals.strength.revenue, emptySessions: totals.strength.emptySessions }
    ];

    // Monthly trends
    const monthlyData = data.reduce((acc, item) => {
      const month = item.monthYear || 'Unknown';
      if (!acc[month]) {
        acc[month] = {
          month,
          powerCycleSessions: 0,
          barreSessions: 0,
          strengthSessions: 0,
          powerCycleRevenue: 0,
          barreRevenue: 0,
          strengthRevenue: 0
        };
      }
      
      acc[month].powerCycleSessions += item.cycleSessions || 0;
      acc[month].barreSessions += item.barreSessions || 0;
      acc[month].strengthSessions += item.strengthSessions || 0;
      acc[month].powerCycleRevenue += item.cyclePaid || 0;
      acc[month].barreRevenue += item.barrePaid || 0;
      acc[month].strengthRevenue += item.strengthPaid || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

    // Top trainers by total revenue
    const trainerData = data
      .map(trainer => ({
        name: trainer.teacherName,
        powerCycleRevenue: trainer.cyclePaid || 0,
        barreRevenue: trainer.barrePaid || 0,
        strengthRevenue: trainer.strengthPaid || 0,
        totalRevenue: (trainer.cyclePaid || 0) + (trainer.barrePaid || 0) + (trainer.strengthPaid || 0),
        location: trainer.location
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return {
      comparison: comparisonData,
      monthly: monthlyTrends,
      trainers: trainerData
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.dataKey.includes('Revenue') ? formatCurrency(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeChart === 'comparison' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('comparison')}
                className="gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Format Comparison
              </Button>
              <Button
                variant={activeChart === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('monthly')}
                className="gap-1"
              >
                <Calendar className="w-4 h-4" />
                Monthly Trends
              </Button>
              <Button
                variant={activeChart === 'trainers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('trainers')}
                className="gap-1"
              >
                <Activity className="w-4 h-4" />
                Top Trainers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        {activeChart === 'comparison' && (
          <>
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Sessions Comparison
                  <Badge variant="outline" className="text-blue-600">
                    Total Sessions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue Comparison
                  <Badge variant="outline" className="text-green-600">
                    Total Revenue
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {activeChart === 'monthly' && (
          <Card className="bg-white shadow-lg border-0 lg:col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Monthly Trends
                <Badge variant="outline" className="text-purple-600">
                  {chartData.monthly.length} months
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="powerCycleSessions" stroke="#3B82F6" strokeWidth={3} name="PowerCycle Sessions" />
                  <Line type="monotone" dataKey="barreSessions" stroke="#EC4899" strokeWidth={3} name="Barre Sessions" />
                  <Line type="monotone" dataKey="strengthSessions" stroke="#F59E0B" strokeWidth={3} name="Strength Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {activeChart === 'trainers' && (
          <Card className="bg-white shadow-lg border-0 lg:col-span-2">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Top Trainers by Revenue
                <Badge variant="outline" className="text-orange-600">
                  Top 10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.trainers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="powerCycleRevenue" stackId="a" fill="#3B82F6" name="PowerCycle" />
                  <Bar dataKey="barreRevenue" stackId="a" fill="#EC4899" name="Barre" />
                  <Bar dataKey="strengthRevenue" stackId="a" fill="#F59E0B" name="Strength" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};