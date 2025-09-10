
import React, { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, Calendar, Users } from 'lucide-react';
import type { SessionData } from '@/types/dashboard';
import { designTokens } from '@/utils/designTokens';

interface PowerCycleVsBarreChartsProps {
  powerCycleData: SessionData[];
  barreData: SessionData[];
}

// Memoized chart components for better performance
const AttendanceChart = memo(({ data, chartType }: { data: any[]; chartType: 'bar' | 'line' }) => (
  <ResponsiveContainer width="100%" height={350}>
    {chartType === 'bar' ? (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <Tooltip 
          formatter={(value, name) => [
            `${value} attendees`,
            typeof name === 'string' && name === 'powerCycle' ? 'PowerCycle' : 'Barre'
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="powerCycle" 
          fill="#3B82F6" 
          name="PowerCycle"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="barre" 
          fill="#EC4899" 
          name="Barre"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    ) : (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <Tooltip 
          formatter={(value, name) => [
            `${value} attendees`,
            typeof name === 'string' && name === 'powerCycle' ? 'PowerCycle' : 'Barre'
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="powerCycle" 
          stroke="#3B82F6" 
          name="PowerCycle" 
          strokeWidth={3}
          dot={{ r: 6, fill: '#3B82F6' }}
          activeDot={{ r: 8, fill: '#1D4ED8' }}
        />
        <Line 
          type="monotone" 
          dataKey="barre" 
          stroke="#EC4899" 
          name="Barre" 
          strokeWidth={3}
          dot={{ r: 6, fill: '#EC4899' }}
          activeDot={{ r: 8, fill: '#BE185D' }}
        />
      </LineChart>
    )}
  </ResponsiveContainer>
));

const FillRateChart = memo(({ data, chartType }: { data: any[]; chartType: 'bar' | 'line' | 'combined' }) => (
  <ResponsiveContainer width="100%" height={350}>
    {chartType === 'combined' ? (
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (typeof name === 'string' && name.includes('Fill')) {
              return [`${Math.round(Number(value))}%`, name];
            }
            return [`${value} sessions`, name];
          }}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="powerCycleCount" 
          fill="#3B82F6" 
          name="PowerCycle Sessions"
          radius={[2, 2, 0, 0]}
          opacity={0.6}
        />
        <Bar 
          dataKey="barreCount" 
          fill="#EC4899" 
          name="Barre Sessions"
          radius={[2, 2, 0, 0]}
          opacity={0.6}
        />
        <Line 
          type="monotone" 
          dataKey="powerCycleFill" 
          stroke="#1D4ED8" 
          name="PowerCycle Fill %" 
          strokeWidth={3}
          dot={{ r: 5, fill: '#1D4ED8' }}
          activeDot={{ r: 7, fill: '#1E40AF' }}
        />
        <Line 
          type="monotone" 
          dataKey="barreFill" 
          stroke="#BE185D" 
          name="Barre Fill %" 
          strokeWidth={3}
          dot={{ r: 5, fill: '#BE185D' }}
          activeDot={{ r: 7, fill: '#9F1239' }}
        />
      </ComposedChart>
    ) : chartType === 'bar' ? (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <Tooltip 
          formatter={(value, name) => [
            `${Math.round(Number(value))}%`,
            typeof name === 'string' && name === 'powerCycleFill' ? 'PowerCycle Fill Rate' : 'Barre Fill Rate'
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="powerCycleFill" 
          fill="#3B82F6" 
          name="PowerCycle Fill %" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="barreFill" 
          fill="#EC4899" 
          name="Barre Fill %" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    ) : (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e5e5e5' }}
        />
        <Tooltip 
          formatter={(value, name) => [
            `${Math.round(Number(value))}%`,
            typeof name === 'string' && name === 'powerCycleFill' ? 'PowerCycle Fill Rate' : 'Barre Fill Rate'
          ]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="powerCycleFill" 
          stroke="#3B82F6" 
          name="PowerCycle Fill %" 
          strokeWidth={3}
          dot={{ r: 6, fill: '#3B82F6' }}
          activeDot={{ r: 8, fill: '#1D4ED8' }}
        />
        <Line 
          type="monotone" 
          dataKey="barreFill" 
          stroke="#EC4899" 
          name="Barre Fill %" 
          strokeWidth={3}
          dot={{ r: 6, fill: '#EC4899' }}
          activeDot={{ r: 8, fill: '#BE185D' }}
        />
      </LineChart>
    )}
  </ResponsiveContainer>
));

export const PowerCycleVsBarreCharts: React.FC<PowerCycleVsBarreChartsProps> = memo(({
  powerCycleData,
  barreData
}) => {
  const [attendanceChartType, setAttendanceChartType] = useState<'bar' | 'line'>('bar');
  const [fillRateChartType, setFillRateChartType] = useState<'bar' | 'line' | 'combined'>('line');

  // Memoized data processing for better performance
  const monthlyData = useMemo(() => {
    const months: Record<string, { 
      month: string; 
      powerCycle: number; 
      barre: number; 
      powerCycleFill: number; 
      barreFill: number;
      powerCycleCapacity: number;
      barreCapacity: number;
      powerCycleCount: number;
      barreCount: number;
    }> = {};
    
    // Process PowerCycle data
    powerCycleData.forEach(session => {
      const monthKey = session.date.substring(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthKey, 
          powerCycle: 0, 
          barre: 0, 
          powerCycleFill: 0, 
          barreFill: 0,
          powerCycleCapacity: 0,
          barreCapacity: 0,
          powerCycleCount: 0,
          barreCount: 0
        };
      }
      
      months[monthKey].powerCycle += session.checkedInCount;
      months[monthKey].powerCycleCapacity += session.capacity;
      months[monthKey].powerCycleCount += 1;
    });

    // Process Barre data
    barreData.forEach(session => {
      const monthKey = session.date.substring(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthKey, 
          powerCycle: 0, 
          barre: 0, 
          powerCycleFill: 0, 
          barreFill: 0,
          powerCycleCapacity: 0,
          barreCapacity: 0,
          powerCycleCount: 0,
          barreCount: 0
        };
      }
      
      months[monthKey].barre += session.checkedInCount;
      months[monthKey].barreCapacity += session.capacity;
      months[monthKey].barreCount += 1;
    });

    // Calculate fill percentages
    Object.values(months).forEach(month => {
      month.powerCycleFill = month.powerCycleCapacity > 0 
        ? (month.powerCycle / month.powerCycleCapacity) * 100 
        : 0;
      month.barreFill = month.barreCapacity > 0 
        ? (month.barre / month.barreCapacity) * 100 
        : 0;
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [powerCycleData, barreData]);

  const totalPowerCycleAttendance = powerCycleData.reduce((sum, session) => sum + session.checkedIn, 0);
  const totalBarreAttendance = barreData.reduce((sum, session) => sum + session.checkedIn, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className={`${designTokens.card.background} ${designTokens.card.shadow} ${designTokens.card.border} overflow-hidden`}>
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Monthly Attendance Comparison
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold">
                {monthlyData.length} months
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={attendanceChartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAttendanceChartType('bar')}
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <BarChart3 className="w-4 h-4" />
                Bar
              </Button>
              <Button
                variant={attendanceChartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAttendanceChartType('line')}
                className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
              >
                <LineChartIcon className="w-4 h-4" />
                Line
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">PowerCycle: {totalPowerCycleAttendance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Barre: {totalBarreAttendance.toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className={designTokens.card.padding}>
          <AttendanceChart data={monthlyData} chartType={attendanceChartType} />
        </CardContent>
      </Card>

      <Card className={`${designTokens.card.background} ${designTokens.card.shadow} ${designTokens.card.border} overflow-hidden`}>
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Fill Rate & Sessions Analysis
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold">
                Interactive
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={fillRateChartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFillRateChartType('bar')}
                className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
              >
                <BarChart3 className="w-4 h-4" />
                Bar
              </Button>
              <Button
                variant={fillRateChartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFillRateChartType('line')}
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <LineChartIcon className="w-4 h-4" />
                Line
              </Button>
              <Button
                variant={fillRateChartType === 'combined' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFillRateChartType('combined')}
                className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
              >
                <Calendar className="w-4 h-4" />
                Combined
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="text-sm text-gray-600">
              Avg PC Fill: {(monthlyData.reduce((sum, m) => sum + m.powerCycleFill, 0) / monthlyData.length || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Avg Barre Fill: {(monthlyData.reduce((sum, m) => sum + m.barreFill, 0) / monthlyData.length || 0).toFixed(1)}%
            </div>
          </div>
        </CardHeader>
        <CardContent className={designTokens.card.padding}>
          <FillRateChart data={monthlyData} chartType={fillRateChartType} />
        </CardContent>
      </Card>
    </div>
  );
});
