import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LateCancellationsData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar } from 'lucide-react';

interface LateCancellationsInteractiveChartsProps {
  data: LateCancellationsData[];
}

export const LateCancellationsInteractiveCharts: React.FC<LateCancellationsInteractiveChartsProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState('6m');
  const [activeChart, setActiveChart] = useState('monthly');
  const [chartMetric, setChartMetric] = useState('count');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      if (!item.dateIST) return false;
      const itemDate = new Date(item.dateIST);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, timeRange]);

  // Monthly cancellations trend data
  const monthlyData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const monthlyGroups = filteredData.reduce((acc, item) => {
      if (!item.dateIST) return acc;
      const date = new Date(item.dateIST);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
          count: 0,
          members: new Set(),
          locations: new Set()
        };
      }
      
      acc[monthKey].count += 1;
      acc[monthKey].members.add(item.memberId);
      acc[monthKey].locations.add(item.location);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(monthlyGroups).map((group: any) => ({
      ...group,
      members: group.members.size,
      locations: group.locations.size
    })).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Top locations data
  const topLocationsData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const locationGroups = filteredData.reduce((acc, item) => {
      const location = item.location || 'Unknown Location';
      
      if (!acc[location]) {
        acc[location] = {
          name: location,
          count: 0,
          members: new Set(),
          classes: new Set()
        };
      }
      
      acc[location].count += 1;
      acc[location].members.add(item.memberId);
      acc[location].classes.add(item.cleanedClass);
      
      return acc;
    }, {} as Record<string, any>);
    
    const locations = Object.values(locationGroups).map((location: any) => ({
      ...location,
      members: location.members.size,
      classes: location.classes.size
    }));
    
    return locations.sort((a: any, b: any) => b.count - a.count).slice(0, 10);
  }, [filteredData]);

  // Class type distribution data
  const classTypeData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const classGroups = filteredData.reduce((acc, item) => {
      const classType = item.cleanedClass || 'Unknown Class';
      
      if (!acc[classType]) {
        acc[classType] = 0;
      }
      
      acc[classType] += 1;
      
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(classGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData]);

  // Day of week data
  const dayOfWeekData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const dayGroups = filteredData.reduce((acc, item) => {
      const day = item.dayOfWeek || 'Unknown';
      
      if (!acc[day]) {
        acc[day] = 0;
      }
      
      acc[day] += 1;
      
      return acc;
    }, {} as Record<string, number>);
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return dayOrder.map(day => ({
      day,
      count: dayGroups[day] || 0
    }));
  }, [filteredData]);

  const COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0891b2'];

  const formatTooltipValue = (value: any, name: string) => {
    return formatNumber(Number(value));
  };

  const handleTimeRangeChange = useCallback((newRange: string) => {
    setTimeRange(newRange);
  }, []);

  const handleChartChange = useCallback((newChart: string) => {
    setActiveChart(newChart);
  }, []);

  const handleMetricChange = useCallback((newMetric: string) => {
    setChartMetric(newMetric);
  }, []);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            Interactive Late Cancellations Charts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-slate-600">No data available for charts</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'monthly':
        return (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={chartMetric === 'count' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMetricChange('count')}
              >
                Cancellations
              </Button>
              <Button
                variant={chartMetric === 'members' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMetricChange('members')}
              >
                Unique Members
              </Button>
              <Button
                variant={chartMetric === 'locations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMetricChange('locations')}
              >
                Locations
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip formatter={formatTooltipValue} />
                <Line 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'locations':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topLocationsData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="count" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'classes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={classTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {classTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'dayofweek':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="count" fill="#ea580c" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Interactive Late Cancellations Charts
            </CardTitle>
          </div>
          
          {/* Time Range Buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Time Range:
            </span>
            {[
              { key: '1m', label: 'Last Month' },
              { key: '3m', label: 'Last 3 Months' },
              { key: '6m', label: 'Last 6 Months' },
              { key: '1y', label: 'Last Year' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={timeRange === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {/* Chart Type Buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Chart Type:
            </span>
            <Button
              variant={activeChart === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('monthly')}
              className="flex items-center gap-1"
            >
              <LineChartIcon className="w-4 h-4" />
              Monthly Trend
            </Button>
            <Button
              variant={activeChart === 'locations' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('locations')}
              className="flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              By Location
            </Button>
            <Button
              variant={activeChart === 'classes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('classes')}
              className="flex items-center gap-1"
            >
              <PieChartIcon className="w-4 h-4" />
              By Class Type
            </Button>
            <Button
              variant={activeChart === 'dayofweek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('dayofweek')}
              className="flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              By Day of Week
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};