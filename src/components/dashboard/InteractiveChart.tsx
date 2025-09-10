
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { SalesData, NewClientData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface InteractiveChartProps {
  title: string;
  data: SalesData[] | NewClientData[];
  type: 'revenue' | 'performance' | 'conversion' | 'retention';
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ title, data, type }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [activeMetric, setActiveMetric] = useState('revenue');

  const processChartData = () => {
    if (type === 'revenue' || type === 'performance') {
      // Check if this is for top products
      if (title.toLowerCase().includes('product')) {
        // Group by products and calculate metrics
        const productData = (data as SalesData[]).reduce((acc, item) => {
          const product = item.cleanedProduct || 'Unknown Product';
          if (!acc[product]) {
            acc[product] = { 
              name: product, 
              revenue: 0, 
              transactions: 0, 
              value: 0,
              members: new Set()
            };
          }
          acc[product].revenue += item.paymentValue || 0;
          acc[product].transactions += 1;
          acc[product].value += item.paymentValue || 0;
          if (item.memberId) {
            acc[product].members.add(item.memberId);
          }
          return acc;
        }, {} as Record<string, any>);

        return Object.values(productData)
          .map((item: any) => ({
            ...item,
            members: item.members.size
          }))
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 10);
      }

      // Monthly data processing
      const monthlyData = (data as SalesData[]).reduce((acc, item) => {
        if (!item.paymentDate) return acc;
        
        // Parse date properly
        let date: Date | null = null;
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        
        if (!date) return acc;
        
        const month = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, transactions: 0, units: 0, members: new Set() };
        }
        acc[month].revenue += item.paymentValue || 0;
        acc[month].transactions += 1;
        acc[month].units += 1;
        if (item.memberId) {
          acc[month].members.add(item.memberId);
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData)
        .map((item: any) => ({
          ...item,
          members: item.members.size
        }))
        .sort((a: any, b: any) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });
    }

    if (type === 'conversion') {
      // New client conversion data processing
      const monthlyData = (data as NewClientData[]).reduce((acc, item) => {
        const date = new Date(item.firstVisitDate);
        const month = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, newClients: 0, conversions: 0, revenue: 0 };
        }
        acc[month].newClients += 1;
        if (item.membershipsBoughtPostTrial === 'Yes') {
          acc[month].conversions += 1;
        }
        acc[month].revenue += item.ltv;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData).sort((a: any, b: any) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    }

    if (type === 'retention') {
      // Retention data by location
      const locationData = (data as NewClientData[]).reduce((acc, item) => {
        const location = item.firstVisitLocation || 'Unknown';
        if (!acc[location]) {
          acc[location] = { name: location, retained: 0, total: 0, revenue: 0 };
        }
        acc[location].total += 1;
        if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
          acc[location].retained += 1;
        }
        acc[location].revenue += item.ltv;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(locationData).sort((a: any, b: any) => b.retained - a.retained);
    }

    // Default category processing for sales data
    const categoryData = (data as SalesData[]).reduce((acc, item) => {
      const category = item.cleanedCategory || 'Other';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0, revenue: 0 };
      }
      acc[category].value += item.paymentValue || 0;
      acc[category].revenue += item.paymentValue || 0;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryData).sort((a: any, b: any) => b.value - a.value);
  };

  const chartData = processChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getDataKey = () => {
    if (type === 'conversion') {
      return activeMetric === 'revenue' ? 'revenue' : activeMetric === 'conversions' ? 'conversions' : 'newClients';
    }
    if (type === 'retention') {
      return activeMetric === 'revenue' ? 'revenue' : activeMetric === 'total' ? 'total' : 'retained';
    }
    return activeMetric === 'revenue' ? 'revenue' : activeMetric === 'transactions' ? 'transactions' : activeMetric === 'members' ? 'members' : 'value';
  };

  const getXAxisKey = () => {
    if (type === 'conversion' || type === 'revenue' || type === 'performance') return title.toLowerCase().includes('product') ? 'name' : 'month';
    return 'name';
  };

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      );
    }

    const dataKey = getDataKey();
    const xAxisKey = getXAxisKey();

    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="#64748b"
                fontSize={12}
                angle={title.toLowerCase().includes('product') ? -45 : 0}
                textAnchor={title.toLowerCase().includes('product') ? 'end' : 'middle'}
                height={title.toLowerCase().includes('product') ? 80 : 30}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => typeof value === 'number' && dataKey.toLowerCase().includes('revenue') 
                  ? formatCurrency(value) 
                  : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--theme-primary, #3B82F6)" />
                  <stop offset="100%" stopColor="var(--theme-secondary, #8B5CF6)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => typeof value === 'number' && dataKey.toLowerCase().includes('revenue') 
                  ? formatCurrency(value) 
                  : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="var(--theme-primary, #3B82F6)" 
                strokeWidth={3}
                dot={{ fill: 'var(--theme-primary, #3B82F6)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--theme-primary, #3B82F6)', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 6)}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey={dataKey}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [
                typeof value === 'number' && dataKey.toLowerCase().includes('revenue') 
                  ? formatCurrency(value) 
                  : value, 
                'Value'
              ]} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getMetricOptions = () => {
    if (type === 'conversion') {
      return [
        { value: 'revenue', label: 'Revenue' },
        { value: 'conversions', label: 'Conversions' },
        { value: 'newClients', label: 'New Clients' }
      ];
    }
    if (type === 'retention') {
      return [
        { value: 'retained', label: 'Retained' },
        { value: 'total', label: 'Total Clients' },
        { value: 'revenue', label: 'Revenue' }
      ];
    }
    return [
      { value: 'revenue', label: 'Revenue' },
      { value: 'transactions', label: 'Transactions' },
      { value: 'members', label: 'Members' }
    ];
  };

  const maxValue = Math.max(...chartData.map((d: any) => d[getDataKey()] || 0));
  const totalTransactions = chartData.reduce((sum: number, d: any) => sum + (d.transactions || d.conversions || d.total || d.count || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('bar')}
              className="gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Bar
            </Button>
            <Button
              variant={activeChart === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('line')}
              className="gap-1"
            >
              <Activity className="w-4 h-4" />
              Line
            </Button>
            <Button
              variant={activeChart === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('pie')}
              className="gap-1"
            >
              <PieChartIcon className="w-4 h-4" />
              Pie
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="mb-4">
          <TabsList className={`grid w-full grid-cols-${getMetricOptions().length}`}>
            {getMetricOptions().map(option => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          {renderChart()}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Advanced Analytics
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Peak performance shows {typeof maxValue === 'number' && activeMetric.toLowerCase().includes('revenue') 
              ? formatCurrency(maxValue) 
              : maxValue} in {activeMetric}</li>
            <li>• Total data points analyzed: {chartData.length}</li>
            <li>• Average per period: {typeof maxValue === 'number' && activeMetric.toLowerCase().includes('revenue') 
              ? formatCurrency(maxValue / Math.max(chartData.length, 1)) 
              : (maxValue / Math.max(chartData.length, 1)).toFixed(1)}</li>
            <li>• Total transactions tracked: {totalTransactions.toLocaleString()}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
