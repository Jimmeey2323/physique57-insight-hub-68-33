import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Target, 
  DollarSign,
  Activity,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionEnhancedChartsProps {
  data: NewClientData[];
}

export const ClientConversionEnhancedCharts: React.FC<ClientConversionEnhancedChartsProps> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState('monthly-trends');

  const chartOptions = [
    { id: 'monthly-trends', label: 'Monthly Trends', icon: TrendingUp, type: 'line' },
    { id: 'conversion-funnel', label: 'Conversion Funnel', icon: Target, type: 'bar' },
    { id: 'location-performance', label: 'Location Performance', icon: MapPin, type: 'bar' },
    { id: 'trainer-performance', label: 'Trainer Performance', icon: Users, type: 'bar' },
    { id: 'retention-analysis', label: 'Retention Analysis', icon: Activity, type: 'area' },
    { id: 'ltv-distribution', label: 'LTV Distribution', icon: DollarSign, type: 'pie' }
  ];

  // Monthly trends data
  const monthlyData = React.useMemo(() => {
    const monthMap = new Map();
    
    data.forEach(client => {
      if (!client.firstVisitDate) return;
      
      let date: Date;
      if (client.firstVisitDate.includes('/')) {
        const [day, month, year] = client.firstVisitDate.split(' ')[0].split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(client.firstVisitDate);
      }
      
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          newMembers: 0,
          converted: 0,
          retained: 0,
          revenue: 0
        });
      }
      
      const monthData = monthMap.get(monthKey);
      
      if (String(client.isNew || '').includes('New')) {
        monthData.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        monthData.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        monthData.retained++;
      }
      monthData.revenue += client.ltv || 0;
    });
    
    return Array.from(monthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        conversionRate: item.newMembers > 0 ? (item.converted / item.newMembers) * 100 : 0,
        retentionRate: item.converted > 0 ? (item.retained / item.converted) * 100 : 0
      }));
  }, [data]);

  // Location performance data
  const locationData = React.useMemo(() => {
    const locationMap = new Map();
    
    data.forEach(client => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location,
          newMembers: 0,
          converted: 0,
          retained: 0,
          revenue: 0
        });
      }
      
      const locationStat = locationMap.get(location);
      
      if (String(client.isNew || '').includes('New')) {
        locationStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        locationStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        locationStat.retained++;
      }
      locationStat.revenue += client.ltv || 0;
    });
    
    return Array.from(locationMap.values())
      .map(item => ({
        ...item,
        conversionRate: item.newMembers > 0 ? (item.converted / item.newMembers) * 100 : 0,
        retentionRate: item.converted > 0 ? (item.retained / item.converted) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  // Trainer performance data
  const trainerData = React.useMemo(() => {
    const trainerMap = new Map();
    
    data.forEach(client => {
      const trainer = client.trainerName || 'Unknown';
      
      if (!trainerMap.has(trainer)) {
        trainerMap.set(trainer, {
          trainer,
          newMembers: 0,
          converted: 0,
          retained: 0,
          revenue: 0
        });
      }
      
      const trainerStat = trainerMap.get(trainer);
      
      if (String(client.isNew || '').includes('New')) {
        trainerStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        trainerStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        trainerStat.retained++;
      }
      trainerStat.revenue += client.ltv || 0;
    });
    
    return Array.from(trainerMap.values())
      .filter(item => item.newMembers >= 3)
      .map(item => ({
        ...item,
        conversionRate: item.newMembers > 0 ? (item.converted / item.newMembers) * 100 : 0,
        retentionRate: item.converted > 0 ? (item.retained / item.converted) * 100 : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);
  }, [data]);

  // LTV distribution data
  const ltvData = React.useMemo(() => {
    const ranges = [
      { name: '₹0-5K', min: 0, max: 5000, count: 0, color: '#ef4444' },
      { name: '₹5K-15K', min: 5000, max: 15000, count: 0, color: '#f97316' },
      { name: '₹15K-30K', min: 15000, max: 30000, count: 0, color: '#eab308' },
      { name: '₹30K-50K', min: 30000, max: 50000, count: 0, color: '#22c55e' },
      { name: '₹50K+', min: 50000, max: Infinity, count: 0, color: '#3b82f6' }
    ];
    
    data.forEach(client => {
      const ltv = client.ltv || 0;
      const range = ranges.find(r => ltv >= r.min && ltv < r.max);
      if (range) range.count++;
    });
    
    return ranges.filter(r => r.count > 0);
  }, [data]);

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4'];

  const renderChart = () => {
    const currentOption = chartOptions.find(c => c.id === selectedChart);
    
    switch (selectedChart) {
      case 'monthly-trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value.toFixed(1)}%` : formatNumber(value),
                  name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="newMembers" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                name="New Members"
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                name="Conversion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'conversion-funnel':
        const funnelData = [
          { name: 'New Members', value: data.filter(c => String(c.isNew || '').includes('New')).length, color: '#3b82f6' },
          { name: 'Trials Completed', value: data.filter(c => (c.visitsPostTrial || 0) > 0).length, color: '#8b5cf6' },
          { name: 'Converted', value: data.filter(c => c.conversionStatus === 'Converted').length, color: '#22c55e' },
          { name: 'Retained', value: data.filter(c => c.retentionStatus === 'Retained').length, color: '#f97316' }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [formatNumber(value), 'Count']}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'location-performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={locationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="location" 
                stroke="#64748b" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value.toFixed(1)}%` : formatNumber(value),
                  name
                ]}
              />
              <Bar dataKey="conversionRate" fill="#22c55e" radius={[4, 4, 0, 0]} name="Conversion Rate" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'trainer-performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trainerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="trainer" 
                stroke="#64748b" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value.toFixed(1)}%` : formatNumber(value),
                  name
                ]}
              />
              <Bar dataKey="conversionRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Conversion Rate" />
              <Bar dataKey="retentionRate" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Retention Rate" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'retention-analysis':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value.toFixed(1)}%` : formatNumber(value),
                  name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="retentionRate" 
                stackId="1"
                stroke="#f97316" 
                fill="url(#retentionGradient)"
                name="Retention Rate"
              />
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'ltv-distribution':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={ltvData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {ltvData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [formatNumber(value), 'Clients']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const currentOption = chartOptions.find(c => c.id === selectedChart);

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <div>
            <h3 className="text-xl font-bold">Analytics Dashboard</h3>
            <p className="text-sm opacity-90">Interactive charts and visualizations</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Chart Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {chartOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedChart === option.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedChart(option.id)}
              className={`flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all duration-300 hover:scale-105 ${
                selectedChart === option.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'hover:bg-slate-100'
              }`}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center leading-tight">
                {option.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Chart Display */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentOption && <currentOption.icon className="w-5 h-5 text-slate-600" />}
              <h4 className="text-lg font-semibold text-slate-800">
                {currentOption?.label}
              </h4>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {data.length} records
            </Badge>
          </div>
          
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};