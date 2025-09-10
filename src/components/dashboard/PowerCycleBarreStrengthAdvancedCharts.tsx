import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  Zap,
  Dumbbell,
  Calendar,
  Users
} from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface PowerCycleBarreStrengthAdvancedChartsProps {
  data: PayrollData[];
  onDataPointClick?: (data: any) => void;
}

export const PowerCycleBarreStrengthAdvancedCharts: React.FC<PowerCycleBarreStrengthAdvancedChartsProps> = ({ 
  data, 
  onDataPointClick 
}) => {
  const [activeChart, setActiveChart] = useState('trends');
  const [activeMetric, setActiveMetric] = useState('sessions');

  const chartData = useMemo(() => {
    const monthlyData = new Map();
    
    data.forEach(item => {
      const key = item.monthYear || 'Unknown';
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          month: key,
          powerCycleSessions: 0,
          barreSessions: 0,
          strengthSessions: 0,
          powerCycleRevenue: 0,
          barreRevenue: 0,
          strengthRevenue: 0,
          powerCycleCustomers: 0,
          barreCustomers: 0,
          strengthCustomers: 0,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0
        });
      }
      
      const existing = monthlyData.get(key);
      monthlyData.set(key, {
        ...existing,
        powerCycleSessions: existing.powerCycleSessions + (item.cycleSessions || 0),
        barreSessions: existing.barreSessions + (item.barreSessions || 0),
        strengthSessions: existing.strengthSessions + (item.strengthSessions || 0),
        powerCycleRevenue: existing.powerCycleRevenue + (item.cyclePaid || 0),
        barreRevenue: existing.barreRevenue + (item.barrePaid || 0),
        strengthRevenue: existing.strengthRevenue + (item.strengthPaid || 0),
        powerCycleCustomers: existing.powerCycleCustomers + (item.cycleCustomers || 0),
        barreCustomers: existing.barreCustomers + (item.barreCustomers || 0),
        strengthCustomers: existing.strengthCustomers + (item.strengthCustomers || 0),
        totalSessions: existing.totalSessions + (item.totalSessions || 0),
        totalRevenue: existing.totalRevenue + (item.totalPaid || 0),
        totalCustomers: existing.totalCustomers + (item.totalCustomers || 0)
      });
    });
    
    return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  const pieData = useMemo(() => {
    const totals = data.reduce((acc, item) => ({
      powerCycle: acc.powerCycle + (item.cycleSessions || 0),
      barre: acc.barre + (item.barreSessions || 0),
      strength: acc.strength + (item.strengthSessions || 0)
    }), { powerCycle: 0, barre: 0, strength: 0 });

    return [
      { name: 'PowerCycle', value: totals.powerCycle, color: '#3B82F6' },
      { name: 'Barre', value: totals.barre, color: '#EC4899' },
      { name: 'Strength Lab', value: totals.strength, color: '#F59E0B' }
    ];
  }, [data]);

  const revenueData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      powerCycleAvg: item.powerCycleSessions > 0 ? item.powerCycleRevenue / item.powerCycleSessions : 0,
      barreAvg: item.barreSessions > 0 ? item.barreRevenue / item.barreSessions : 0,
      strengthAvg: item.strengthSessions > 0 ? item.strengthRevenue / item.strengthSessions : 0
    }));
  }, [chartData]);

  const metricOptions = [
    { value: 'sessions', label: 'Sessions', icon: Calendar },
    { value: 'revenue', label: 'Revenue', icon: TrendingUp },
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'avgRevenue', label: 'Avg Revenue per Session', icon: BarChart3 }
  ];

  const getChartDataByMetric = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return chartData.map(item => ({
          month: item.month,
          PowerCycle: item.powerCycleRevenue,
          Barre: item.barreRevenue,
          'Strength Lab': item.strengthRevenue
        }));
      case 'customers':
        return chartData.map(item => ({
          month: item.month,
          PowerCycle: item.powerCycleCustomers,
          Barre: item.barreCustomers,
          'Strength Lab': item.strengthCustomers
        }));
      case 'avgRevenue':
        return revenueData.map(item => ({
          month: item.month,
          PowerCycle: Math.round(item.powerCycleAvg),
          Barre: Math.round(item.barreAvg),
          'Strength Lab': Math.round(item.strengthAvg)
        }));
      default: // sessions
        return chartData.map(item => ({
          month: item.month,
          PowerCycle: item.powerCycleSessions,
          Barre: item.barreSessions,
          'Strength Lab': item.strengthSessions
        }));
    }
  };

  const currentChartData = getChartDataByMetric(activeMetric);

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Analytics Dashboard
          </CardTitle>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {metricOptions.map(option => (
              <Button
                key={option.value}
                variant={activeMetric === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMetric(option.value)}
                className={`gap-2 ${
                  activeMetric === option.value 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Chart Tabs */}
      <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="trends" className="text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="distribution" className="text-sm font-medium">
                <PieChartIcon className="w-4 h-4 mr-2" />
                Distribution
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Monthly Trends - {metricOptions.find(m => m.value === activeMetric)?.label}
                </div>
                <Badge className="bg-blue-600 text-white">
                  {currentChartData.length} months
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={currentChartData}>
                  <defs>
                    <linearGradient id="colorPowerCycle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorBarre" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      activeMetric === 'revenue' || activeMetric === 'avgRevenue' 
                        ? formatCurrency(Number(value)) 
                        : formatNumber(Number(value)), 
                      name
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="PowerCycle"
                    stackId="1"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPowerCycle)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Barre"
                    stackId="1"
                    stroke="#EC4899"
                    fillOpacity={1}
                    fill="url(#colorBarre)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Strength Lab"
                    stackId="1"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#colorStrength)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Chart */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Side-by-Side Comparison - {metricOptions.find(m => m.value === activeMetric)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      activeMetric === 'revenue' || activeMetric === 'avgRevenue' 
                        ? formatCurrency(Number(value)) 
                        : formatNumber(Number(value)), 
                      name
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="PowerCycle" 
                    fill="#3B82F6" 
                    onClick={(data) => onDataPointClick?.(data)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="Barre" 
                    fill="#EC4899"
                    onClick={(data) => onDataPointClick?.(data)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="Strength Lab" 
                    fill="#F59E0B"
                    onClick={(data) => onDataPointClick?.(data)}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Chart */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Class Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Distribution Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{formatNumber(item.value)}</div>
                      <div className="text-gray-300 text-sm">
                        {((item.value / pieData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      activeMetric === 'revenue' || activeMetric === 'avgRevenue' 
                        ? formatCurrency(Number(value)) 
                        : formatNumber(Number(value)), 
                      name
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="PowerCycle"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Barre"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Strength Lab"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};