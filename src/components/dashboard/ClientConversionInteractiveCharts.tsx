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
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Calendar,
  Users,
  Target,
  DollarSign
} from 'lucide-react';
import { NewClientData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface ClientConversionInteractiveChartsProps {
  data: NewClientData[];
}

type ChartType = 'monthly' | 'conversion' | 'ltv' | 'retention';
type ViewType = 'bar' | 'line' | 'pie' | 'area';

export const ClientConversionInteractiveCharts: React.FC<ClientConversionInteractiveChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('monthly');
  const [viewType, setViewType] = useState<ViewType>('bar');

  // Prepare monthly data
  const monthlyData = React.useMemo(() => {
    const monthlyStats = new Map();
    
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
      
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthKey,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          totalClients: 0
        });
      }
      
      const stat = monthlyStats.get(monthKey);
      stat.totalClients++;
      stat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        stat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        stat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        stat.retained++;
      }
    });
    
    return Array.from(monthlyStats.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(stat => ({
        ...stat,
        conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
        retentionRate: stat.converted > 0 ? (stat.retained / stat.converted) * 100 : 0,
        avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0
      }));
  }, [data]);

  // Prepare conversion funnel data
  const conversionFunnelData = React.useMemo(() => {
    const totalClients = data.length;
    const newMembers = data.filter(client => String(client.isNew || '').includes('New')).length;
    const converted = data.filter(client => client.conversionStatus === 'Converted').length;
    const retained = data.filter(client => client.retentionStatus === 'Retained').length;
    
    return [
      { stage: 'Total Clients', count: totalClients, percentage: 100 },
      { stage: 'New Members', count: newMembers, percentage: totalClients > 0 ? (newMembers / totalClients) * 100 : 0 },
      { stage: 'Converted', count: converted, percentage: totalClients > 0 ? (converted / totalClients) * 100 : 0 },
      { stage: 'Retained', count: retained, percentage: totalClients > 0 ? (retained / totalClients) * 100 : 0 }
    ];
  }, [data]);

  // Prepare LTV distribution data
  const ltvData = React.useMemo(() => {
    const ranges = [
      { range: '₹0-5K', min: 0, max: 5000, count: 0, color: '#ef4444' },
      { range: '₹5K-15K', min: 5000, max: 15000, count: 0, color: '#f97316' },
      { range: '₹15K-30K', min: 15000, max: 30000, count: 0, color: '#eab308' },
      { range: '₹30K-50K', min: 30000, max: 50000, count: 0, color: '#22c55e' },
      { range: '₹50K+', min: 50000, max: Infinity, count: 0, color: '#3b82f6' }
    ];
    
    data.forEach(client => {
      const ltv = client.ltv || 0;
      const range = ranges.find(r => ltv >= r.min && ltv < r.max);
      if (range) range.count++;
    });
    
    return ranges;
  }, [data]);

  // Prepare retention analysis data
  const retentionData = React.useMemo(() => {
    const statusCount = {
      'Retained': 0,
      'Not Retained': 0,
      'At Risk': 0,
      'Unknown': 0
    };
    
    data.forEach(client => {
      const status = client.retentionStatus || 'Unknown';
      if (status in statusCount) {
        statusCount[status]++;
      } else {
        statusCount['Unknown']++;
      }
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: data.length > 0 ? (count / data.length) * 100 : 0
    }));
  }, [data]);

  const chartButtons = [
    { key: 'monthly', label: 'Monthly Trends', icon: Calendar },
    { key: 'conversion', label: 'Conversion Funnel', icon: Target },
    { key: 'ltv', label: 'LTV Distribution', icon: DollarSign },
    { key: 'retention', label: 'Retention Analysis', icon: Users }
  ];

  const viewButtons = [
    { key: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { key: 'line', label: 'Line Chart', icon: LineChartIcon },
    { key: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { key: 'area', label: 'Area Chart', icon: TrendingUp }
  ];

  const renderChart = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    
    switch (activeChart) {
      case 'monthly':
        if (viewType === 'line') {
          return (
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'avgLTV' ? formatCurrency(value as number) : value,
                name
              ]} />
              <Legend />
              <Line type="monotone" dataKey="newMembers" stroke="#3b82f6" name="New Members" />
              <Line type="monotone" dataKey="converted" stroke="#10b981" name="Converted" />
              <Line type="monotone" dataKey="retained" stroke="#8b5cf6" name="Retained" />
            </LineChart>
          );
        } else if (viewType === 'area') {
          return (
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="newMembers" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="New Members" />
              <Area type="monotone" dataKey="converted" stackId="1" stroke="#10b981" fill="#10b981" name="Converted" />
              <Area type="monotone" dataKey="retained" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Retained" />
            </AreaChart>
          );
        } else {
          return (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newMembers" fill="#3b82f6" name="New Members" />
              <Bar dataKey="converted" fill="#10b981" name="Converted" />
              <Bar dataKey="retained" fill="#8b5cf6" name="Retained" />
            </BarChart>
          );
        }
        
      case 'conversion':
        if (viewType === 'pie') {
          return (
            <PieChart>
              <Pie
                data={conversionFunnelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ stage, percentage }) => `${stage}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {conversionFunnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );
        } else {
          return (
            <BarChart data={conversionFunnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          );
        }
        
      case 'ltv':
        if (viewType === 'pie') {
          return (
            <PieChart>
              <Pie
                data={ltvData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count }) => `${range}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {ltvData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );
        } else {
          return (
            <BarChart data={ltvData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          );
        }
        
      case 'retention':
        if (viewType === 'pie') {
          return (
            <PieChart>
              <Pie
                data={retentionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {retentionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );
        } else {
          return (
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          );
        }
        
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Interactive Analytics</h3>
              <p className="text-blue-100 text-sm">Dynamic data visualization</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {data.length} Records
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Chart Type Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {chartButtons.map(button => (
              <Button
                key={button.key}
                variant={activeChart === button.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart(button.key as ChartType)}
                className="gap-2"
              >
                <button.icon className="w-4 h-4" />
                {button.label}
              </Button>
            ))}
          </div>
          
          {/* View Type Buttons */}
          <div className="flex flex-wrap gap-2">
            {viewButtons.map(button => (
              <Button
                key={button.key}
                variant={viewType === button.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewType(button.key as ViewType)}
                className="gap-2"
              >
                <button.icon className="w-4 h-4" />
                {button.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};